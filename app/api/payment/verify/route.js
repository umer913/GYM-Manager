import Stripe from "stripe";
import { wrapHandler } from "../../../../backend/utils/app-router-adapter";
import { authenticate } from "../../../../backend/utils/auth";
import dbConnect from "../../../../backend/lib/mongodb";
import User from "../../../../backend/models/User";
import Plan from "../../../../backend/models/Plan";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  await dbConnect();

  authenticate(req, res, async () => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) return res.status(400).json({ success: false, message: "sessionId is required" });

      // Retrieve the session from Stripe
      const session = await getStripe().checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== "paid") {
        return res.status(400).json({ success: false, message: "Payment not completed" });
      }

      const { type, userId, planId } = session.metadata;

      // Security: ensure the session belongs to the authenticated user
      if (userId !== String(req.user.userId)) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
      }

      // ── Activate plan ──────────────────────────────────────────────────────
      if (type === "plan") {
        const plan = await Plan.findById(planId);
        if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

        const member = await User.findById(userId);
        if (!member) return res.status(404).json({ success: false, message: "Member not found" });

        // If plan doesn't allow trainer, remove assigned trainer
        if (!plan.allowsTrainer) member.assignedTrainer = null;

        member.plan = plan._id;
        member.membershipStatus = "active";
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);
        member.membershipExpiresAt = expiry;
        await member.save();

        const updated = await User.findById(userId).select("-password").populate("plan").populate("assignedTrainer");

        return res.status(200).json({
          success: true,
          message: `Successfully subscribed to ${plan.name}`,
          member: {
            plan: updated.plan ? {
              id: updated.plan._id,
              name: updated.plan.name,
              price: updated.plan.price,
              duration: updated.plan.duration,
              allowsTrainer: updated.plan.allowsTrainer,
              features: updated.plan.features,
            } : null,
            trainer: updated.assignedTrainer ? {
              id: updated.assignedTrainer._id,
              name: updated.assignedTrainer.name,
            } : null,
            membershipStatus: updated.membershipStatus,
            membershipExpiresAt: updated.membershipExpiresAt,
          },
        });
      }

      // ── Create order ───────────────────────────────────────────────────────
      if (type === "order") {
        // Import order model dynamically to avoid circular deps
        const { default: Order } = await import("../../../../backend/models/Order");
        const cartItems = JSON.parse(session.metadata.cartItems || "[]");

        const order = await Order.create({
          user: userId,
          items: cartItems.map((i) => ({
            product: i.productId,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          totalAmount: session.amount_total / 100,
          shippingAddress: session.metadata.shippingAddress,
          contactPhone: session.metadata.contactPhone,
          notes: session.metadata.notes,
          status: "confirmed",
          stripeSessionId: session.id,
        });

        return res.status(200).json({
          success: true,
          message: "Order placed successfully!",
          orderId: order._id,
        });
      }

      return res.status(400).json({ success: false, message: "Unknown payment type" });
    } catch (error) {
      console.error("Payment verify error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });
}

export const POST = wrapHandler(handler);
