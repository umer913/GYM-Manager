import Stripe from "stripe";
import { wrapHandler } from "../../../../backend/utils/app-router-adapter";
import { authenticate } from "../../../../backend/utils/auth";
import dbConnect from "../../../../backend/lib/mongodb";
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
      const { type, planId, cartItems, orderForm } = req.body;
      const origin = req.headers.origin || "http://localhost:3000";

      // ── Plan subscription checkout ─────────────────────────────────────────
      if (type === "plan") {
        if (!planId) return res.status(400).json({ success: false, message: "planId is required" });

        const plan = await Plan.findById(planId);
        if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

        const session = await getStripe().checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "pkr",
                product_data: {
                  name: `${plan.name} — Gym Membership`,
                  description: `${plan.duration} · ${plan.allowsTrainer ? "Includes Personal Trainer" : "No Trainer"}`,
                },
                unit_amount: Math.round(plan.price * 100),
              },
              quantity: 1,
            },
          ],
          metadata: {
            type: "plan",
            userId: String(req.user.userId),
            planId: String(planId),
          },
          success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=plan`,
          cancel_url: `${origin}/MemberDashboard/Plans?cancelled=1`,
        });

        return res.status(200).json({ success: true, url: session.url, sessionId: session.id });
      }

      // ── Store cart checkout ────────────────────────────────────────────────
      if (type === "order") {
        if (!cartItems?.length) return res.status(400).json({ success: false, message: "Cart is empty" });

        const lineItems = cartItems.map((item) => ({
          price_data: {
            currency: "pkr",
            product_data: {
              name: item.name,
              ...(item.images?.[0] ? { images: [item.images[0]] } : {}),
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }));

        const session = await getStripe().checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: lineItems,
          metadata: {
            type: "order",
            userId: String(req.user.userId),
            shippingAddress: orderForm?.shippingAddress || "",
            contactPhone: orderForm?.contactPhone || "",
            notes: orderForm?.notes || "",
            // Store cart as JSON string in metadata (max 500 chars each)
            cartItems: JSON.stringify(
              cartItems.map((i) => ({ productId: i._id, quantity: i.quantity, price: i.price, name: i.name }))
            ).slice(0, 499),
          },
          success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=order`,
          cancel_url: `${origin}/MemberDashboard/store?cancelled=1`,
        });

        return res.status(200).json({ success: true, url: session.url, sessionId: session.id });
      }

      return res.status(400).json({ success: false, message: "Invalid checkout type" });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });
}

export const POST = wrapHandler(handler);
