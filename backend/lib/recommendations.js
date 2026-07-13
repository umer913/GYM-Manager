/**
 * Advanced Rule-Based Fitness Recommendation Engine
 * Zero external dependencies — pure server-side JS.
 *
 * Features:
 *  - 10 workout programs across 8 specialties
 *  - 8 diet plans covering all major goals
 *  - Progressive overload notes per exercise
 *  - Warm-up & cool-down protocols
 *  - Supplement stack per goal
 *  - Hydration & sleep targets
 *  - Weekly volume & intensity metrics
 *  - Multi-signal scoring for best-match selection
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ex = (name, sets, reps, notes = '', tip = '') => ({ name, sets, reps, notes, tip });
const day = (dayName, focus, restDay, exercises, warmUp = [], coolDown = []) =>
  ({ day: dayName, focus, restDay, exercises, warmUp, coolDown });
const rest = (dayName) => day(dayName, 'Rest & Recovery', true, [], [], []);


// ─── WORKOUT PROGRAMS ────────────────────────────────────────────────────────
// Each key can hold multiple programs. The matcher picks based on scoring.

const WORKOUT_PROGRAMS = {

  // ── 1. GENERAL / INTERMEDIATE ───────────────────────────────────────────────
  general: {
    label: 'Push / Pull / Legs Split',
    level: 'Intermediate',
    goal: 'Overall Fitness & Muscle Balance',
    daysPerWeek: 6,
    weeklyVolume: '18–22 sets per muscle group',
    progressionRule: 'Add 2.5 kg to compound lifts every week. Add 1 rep to isolation lifts each session.',
    schedule: [
      day('Monday', 'Push — Chest / Shoulders / Triceps', false,
        [
          ex('Barbell Bench Press',       '5', '5, 4, 3, 2, 1',    '85–90 % 1RM — true strength work',     'Retract scapulae, drive feet into floor'),
          ex('Incline Dumbbell Press',    '4', '8–10',              'Pause 1 sec at bottom',                 'Elbows at 45 ° to body'),
          ex('Cable Chest Fly',           '3', '12–15',             'Full stretch at bottom',               'Squeeze hard at peak'),
          ex('Seated Dumbbell OHP',       '4', '8–10',              'Strict form, no leg drive',            'Exhale on the press'),
          ex('Cable Lateral Raise',       '3', '15–20',             'Light weight, perfect arc',            'Lead with elbows, not wrists'),
          ex('Overhead Tricep Extension', '3', '12',                'Long-head emphasis',                   'Keep elbows tight'),
          ex('Tricep Pushdown (rope)',    '3', '15',                'Squeeze at full extension',            ''),
        ],
        ['5 min light cardio', 'Arm circles 30 sec', 'Band pull-aparts 15 reps'],
        ['Chest stretch 60 sec each side', 'Shoulder cross-body stretch', "Child's pose 60 sec"]),

      day('Tuesday', 'Pull — Back / Biceps / Rear Delts', false,
        [
          ex('Conventional Deadlift',     '4', '5',                 '80 % 1RM, reset each rep',             'Bar stays over mid-foot throughout'),
          ex('Weighted Pull-ups',         '4', '6–8',               'Add 5 kg when 3×8 achieved',           'Full hang, chest to bar'),
          ex('Barbell Bent-Over Row',     '4', '8',                 'Overhand, horizontal torso',           'Row to lower sternum'),
          ex('Seated Cable Row',          '3', '10–12',             'Pause 1 sec at chest',                 'Drive elbows back, not up'),
          ex('Face Pulls',                '3', '20',                'External rotation emphasis',           'Pull to forehead, not neck'),
          ex('Incline Dumbbell Curl',     '3', '10–12',             'Full stretch at bottom',               'No swinging'),
          ex('Hammer Curl',               '2', '12',                'Brachialis & brachioradialis',         ''),
        ],
        ['Cat-cow 10 reps', 'Band pull-aparts 20 reps', 'Hip hinge practice 10 reps'],
        ['Lat stretch 60 sec each', 'Doorway chest opener', 'Supine spinal twist']),

      day('Wednesday', 'Legs — Quads / Hamstrings / Glutes / Calves', false,
        [
          ex('Back Squat',                '5', '5',                 '80 % 1RM — add 2.5 kg/week',           'Below parallel, knees track toes'),
          ex('Romanian Deadlift',         '4', '10',                'Feel hamstring stretch at bottom',     'Hinge at hips, soft knee bend'),
          ex('Leg Press',                 '3', '12',                'Feet shoulder-width, full ROM',        "Don't lock knees at top"),
          ex('Walking Dumbbell Lunge',    '3', '12 / leg',          'Control the descent',                  'Front knee stays over ankle'),
          ex('Leg Curl (machine)',        '3', '12–15',             'Pause at peak contraction',            "Don't use momentum"),
          ex('Standing Calf Raise',       '5', '15',                'Full stretch, full rise',              'Slow eccentric — 3 sec down'),
          ex('Seated Calf Raise',         '3', '20',                'Soleus emphasis',                     ''),
        ],
        ['Leg swings 15 each', 'Bodyweight squat 20 reps', 'Hip circle 10 each direction'],
        ['Quad stretch 60 sec each', 'Pigeon pose 90 sec each', 'Hamstring doorway stretch']),

      rest('Thursday'),

      day('Friday', 'Push (Volume Focus)', false,
        [
          ex('Incline Barbell Press',     '4', '8–10',              'Moderate weight, focus on feel',       'Upper chest activation'),
          ex('Flat Dumbbell Press',       '4', '10–12',             'Full ROM, slight flare',               'Squeeze at top'),
          ex('Pec Deck / Machine Fly',    '3', '15',                'Constant tension',                     ''),
          ex('Push Press',                '4', '6',                 'Controlled leg drive',                 'Lock out overhead'),
          ex('Dumbbell Lateral Raise',    '4', '15',                'Drop set on last set',                 ''),
          ex('Close-Grip Bench Press',    '3', '10',                'Tricep strength builder',              'Elbows tuck in'),
          ex('Cable Overhead Extension', '3', '15',                'Stretch at top',                       ''),
        ],
        ['5 min bike', 'Shoulder dislocations 10 reps'],
        ['Tricep stretch', 'Pec stretch on wall', 'Neck rolls']),

      day('Saturday', 'Pull (Volume Focus)', false,
        [
          ex('Chest-Supported Row',       '4', '10–12',             'Eliminate momentum completely',        'Squeeze shoulder blades'),
          ex('Lat Pulldown',              '4', '10–12',             'Full stretch at top',                  'Slight lean back, drive elbows down'),
          ex('One-Arm Dumbbell Row',      '3', '12 / side',         'Brace on bench, full range',           ''),
          ex('Reverse Pec Deck',          '3', '15–20',             'Rear delt isolation',                  'Slight forward lean'),
          ex('Straight-Arm Pulldown',     '3', '15',                'Lat activation drill',                 'Arms stay straight'),
          ex('Preacher Curl',             '3', '10–12',             'No swinging, peak squeeze',            ''),
          ex('Spider Curl',               '2', '15',                'Short-head isolation',                 ''),
        ],
        ['Thoracic rotations', 'Band pull-aparts'],
        ['Lat stretch overhead', 'Bicep wall stretch', 'Foam roll upper back']),

      rest('Sunday'),
    ],
  },


  // ── 2. STRENGTH / POWERLIFTING ────────────────────────────────────────────────
  strength: {
    label: '5/3/1 Powerbuilding Program',
    level: 'Advanced',
    goal: 'Maximum Strength & Power',
    daysPerWeek: 4,
    weeklyVolume: 'Low volume, high intensity (3–5 sets @ 85–95% 1RM)',
    progressionRule: 'Increase main lift by 2.5 kg (upper) or 5 kg (lower) each cycle. Deload every 4th week.',
    schedule: [
      day('Monday', 'Squat Day — Lower Strength', false,
        [
          ex('Back Squat',                '1', '5 @ 65%, 5 @ 75%, 5+ @ 85%', 'AMRAP on last set',     'Break parallel every rep'),
          ex('Close-Stance Squat',        '3', '8',                'Quad emphasis',                        ''),
          ex('Leg Press',                 '5', '10',               'High foot placement for glutes',       ''),
          ex('Romanian Deadlift',         '3', '10',               'Hamstring accessory',                  ''),
          ex('Leg Curl',                  '3', '12',               '',                                     ''),
          ex('Plank',                     '3', '60 sec',           'Anti-rotation core',                   ''),
          ex('Ab Wheel Rollout',          '3', '10',               'Full extension',                       ''),
        ],
        ['10 min treadmill walk', 'Deep squat holds 30 sec x5', 'Hip flexor stretch'],
        ['PNF hamstring stretch', 'Pigeon pose 2 min each', 'Foam roll quads & IT band']),

      day('Tuesday', 'Bench Press Day — Upper Strength', false,
        [
          ex('Flat Bench Press',          '1', '5 @ 65%, 5 @ 75%, 5+ @ 85%', 'AMRAP on last set',     'Touch and go — controlled'),
          ex('Close-Grip Bench Press',    '4', '8',               'Tricep overload accessory',            ''),
          ex('Incline Dumbbell Press',    '3', '10',              '',                                     ''),
          ex('Weighted Dips',             '3', '8',               'Chest lean forward',                   'Add weight once 3×10 bodyweight'),
          ex('Cable Fly',                 '3', '15',              'Stretch & squeeze',                    ''),
          ex('Tricep Pushdown',           '4', '12',              '',                                     ''),
          ex('Skull Crushers',            '3', '10',              'EZ-bar, slow eccentric',               ''),
        ],
        ['Band pull-aparts 30 reps', 'Push-up to warm wrists'],
        ['Pec stretch', 'Overhead tricep stretch', 'Wrist flexor stretch']),

      rest('Wednesday'),

      day('Thursday', 'Deadlift Day — Posterior Chain', false,
        [
          ex('Conventional Deadlift',     '1', '5 @ 65%, 3 @ 75%, 1+ @ 85%', 'AMRAP on last set',     'Brace hard, bar drags shins'),
          ex('Deficit Deadlift',          '3', '5',               '2-inch deficit, builds off floor',    ''),
          ex('Good Mornings',             '3', '10',              'Hamstring & low back accessory',      ''),
          ex('Barbell Hip Thrust',        '4', '10',              'Glute activation at top',             'Pause 1 sec at top'),
          ex('Back Extension',            '3', '15',              'Bodyweight or light plate',           ''),
          ex('Hanging Leg Raise',         '3', '12',              '',                                    ''),
          ex('Pallof Press',              '3', '12 each',         'Anti-rotation core stability',        ''),
        ],
        ['McGill Big 3: Bird-dog, curl-up, side plank', 'Hip circle 10 each'],
        ['Piriformis stretch', 'Seated hamstring stretch', "Low back child's pose"]),

      day('Friday', 'Overhead Press Day — Shoulder Strength', false,
        [
          ex('Standing Barbell OHP',      '1', '5 @ 65%, 5 @ 75%, 5+ @ 85%', 'AMRAP on last set',     'Squeeze glutes, lock rib cage'),
          ex('Push Press',                '4', '5',               'Controlled leg drive, strict lockout',''),
          ex('Seated Dumbbell Press',     '3', '10',              'Unilateral stability demand',         ''),
          ex('Arnold Press',              '3', '10',              'Full rotation, 3D shoulder work',     ''),
          ex('Upright Row',               '3', '10',              'Wide grip, elbows lead',              ''),
          ex('Lateral Raise (cable)',     '4', '15',              'Constant tension',                    ''),
          ex('Rear Delt Fly',             '4', '20',              'Light weight, strict form',           ''),
        ],
        ['Band shoulder warmup circuit 2 rounds'],
        ['Cross-body shoulder stretch', 'Doorway stretch', 'Foam roll thoracic spine']),

      rest('Saturday'),
      rest('Sunday'),
    ],
  },


  // ── 3. CARDIO / ENDURANCE ─────────────────────────────────────────────────────
  cardio: {
    label: 'Periodised Cardio & Conditioning',
    level: 'Intermediate',
    goal: 'Cardiovascular Endurance & Fat Burn',
    daysPerWeek: 6,
    weeklyVolume: '5–7 hours total cardio, 2 resistance sessions',
    progressionRule: 'Increase long-run distance by 10% per week. Add 30 sec to HIIT intervals every 2 weeks.',
    schedule: [
      day('Monday', 'HIIT & Metabolic Conditioning', false,
        [
          ex('Jump Rope — Double-Under Practice', '5', '3 min on / 1 min off',  'Max intensity on work sets',        'Stay on balls of feet'),
          ex('Burpee Box Jump',                  '4', '10',                      'Explosive hip extension at top',    ''),
          ex('Kettlebell Swing',                 '4', '20',                      'Hip snap, not squat',               'Pack shoulders'),
          ex('Battle Rope Alternating Waves',    '4', '40 sec / 20 sec rest',    'Drive from hips',                   ''),
          ex('Sled Push (or Bear Crawl)',         '3', '20 m',                   'Low hips, powerful steps',          ''),
          ex('Mountain Climbers',                '3', '40',                      'Hips level, core tight',            ''),
        ],
        ['5 min brisk walk', '10 leg swings each', 'Hip mobility flow 5 min'],
        ['Static full-body stretch 10 min', 'Foam roll calves & quads', 'Box breathing 5 min']),

      day('Tuesday', 'Strength Circuit (Upper Body)', false,
        [
          ex('Push-up Variations (flat, wide, narrow)', '4', '15 each',   'No rest between variations',      ''),
          ex('Pull-up / Inverted Row',              '4', '8–10',           'Chest to bar on pull-ups',        ''),
          ex('Dumbbell Renegade Row',               '3', '10 / side',      'Keep hips level',                 ''),
          ex('Pike Push-up',                        '3', '12',             'Shoulder strength',               ''),
          ex('TRX / Ring Row',                      '3', '15',             'Lean back for difficulty',        ''),
          ex('Plank to Down-Dog',                   '3', '10 reps',        'Shoulder mobility + core',        ''),
        ],
        ['Arm circles', 'Shoulder mobility band work'],
        ['Chest opener', 'Thoracic rotation stretch']),

      day('Wednesday', 'Steady-State Aerobic Base', false,
        [
          ex('Treadmill / Outdoor Run',             '1', '45–50 min',       '65–70% max HR (conversational)',  'Nasal breathing if possible'),
          ex('Stair Climber',                       '1', '10 min',          'Cool-down pace',                  ''),
        ],
        ['Dynamic leg swings', '2 min easy jog'],
        ['Full lower body stretch 10 min', 'Calf raises on step 20 reps']),

      day('Thursday', 'Interval Training (Track / Treadmill)', false,
        [
          ex('400m Sprint Intervals',               '6–8', '400m @ 90% effort / 90 sec rest', 'Focus on form when fatigued', 'Land midfoot'),
          ex('Lateral Shuffle',                     '3',   '30 m each direction',             'Agility & hip mobility',      ''),
          ex('High Knees',                          '3',   '30 sec',                           '',                            ''),
          ex('Core Circuit: Plank / Side Plank / V-up', '3', '30 sec each / 10 reps', 'No rest within circuit', ''),
        ],
        ['800m easy jog warm-up', 'Dynamic drills: A-skip, B-skip, butt kick'],
        ['800m cool-down walk', 'Hip flexor lunge stretch 60 sec each']),

      day('Friday', 'Strength Circuit (Lower Body)', false,
        [
          ex('Goblet Squat',                        '4', '15',              'Pause 2 sec at bottom',           ''),
          ex('Single-Leg Romanian Deadlift',        '3', '12 / leg',        'Hip hinge, balance challenge',    ''),
          ex('Jump Squat',                          '4', '10',              'Land softly, recoil immediately', ''),
          ex('Step-Up with Knee Drive',             '3', '12 / leg',        'Full hip extension at top',       ''),
          ex('Glute Bridge (loaded or bodyweight)', '4', '20',              'Drive hips to ceiling',           ''),
          ex('Wall Sit',                            '3', '60 sec',          'Quads on fire',                   ''),
        ],
        ['Leg swings', 'Hip mobility circles', '10 bodyweight squats'],
        ['Quad stretch', 'Figure-4 glute stretch', 'Calf stretch on wall']),

      day('Saturday', 'Long Aerobic Session', false,
        [
          ex('Outdoor Run, Bike, or Swim',          '1', '60–75 min',       '60–65% max HR — fat-burning zone', 'Bring water, gel at 45 min mark'),
        ],
        ['5 min easy pace start'],
        ['Full body stretch 15 min', 'Contrast shower (hot/cold) for recovery']),

      rest('Sunday'),
    ],
  },


  // ── 4. BODYBUILDING / HYPERTROPHY ─────────────────────────────────────────────
  bodybuilding: {
    label: 'Classic Bodybuilding Hypertrophy Split',
    level: 'Intermediate–Advanced',
    goal: 'Maximum Muscle Size & Aesthetics',
    daysPerWeek: 5,
    weeklyVolume: '15–20 sets per muscle group per week',
    progressionRule: 'Progressive overload via reps first (hit top of range all sets) then add weight. Track every session.',
    schedule: [
      day('Monday', 'Chest — Full Development', false,
        [
          ex('Flat Barbell Bench Press',   '5', '6–8',    '75–80% 1RM, control eccentric (3 sec)',  'Arch back, drive through pecs not shoulders'),
          ex('Incline Dumbbell Press',     '4', '8–10',   'Slight incline 30°, upper chest stretch',''),
          ex('Decline Barbell Press',      '3', '10–12',  'Lower pec sweep',                        ''),
          ex('Cable Crossover (low)',      '3', '12–15',  'Upper pec emphasis',                     ''),
          ex('Dumbbell Fly',               '3', '12',     'Slight bend in elbow, deep stretch',     ''),
          ex('Push-up (weighted vest)',    '2', 'failure', 'Burnout finisher',                      ''),
        ],
        ['Light cardio 5 min', 'Band pull-aparts 20 reps', 'Shoulder rotation drill'],
        ['Chest doorway stretch 60 sec', 'Thoracic extension over foam roller']),

      day('Tuesday', 'Back — Width & Thickness', false,
        [
          ex('Deadlift (conventional)',    '4', '6',      '75% 1RM — back builder, not max effort', 'Neutral spine throughout'),
          ex('Wide-Grip Pull-up',          '4', '8–10',   'Full hang to chin above bar',            'Depress scapulae at start'),
          ex('T-Bar Row',                  '4', '8–10',   'Thickness builder',                      "Don't round lower back"),
          ex('Lat Pulldown (underhand)',   '3', '12',     'Bicep-lat connection, squeeze peak',     ''),
          ex('Seated Cable Row',           '3', '12',     'Elbows tight to body',                   ''),
          ex('Straight-Arm Pushdown',      '3', '15',     'Lat isolation',                          ''),
          ex('Rack Pull',                  '2', '5',      'Lockout strength',                       ''),
        ],
        ['McGill Big 3 warm-up', 'Band pull-aparts'],
        ['Lat overhead stretch', 'Foam roll thoracic', "Child's pose"]),

      day('Wednesday', 'Shoulders — 3D Development', false,
        [
          ex('Seated Barbell Press (Smith or Free)', '5', '6–8', 'Strict form, full lockout',      ''),
          ex('Dumbbell Arnold Press',      '4', '10–12',  'Full rotation, 360° shoulder work',      ''),
          ex('Cable Lateral Raise',        '4', '15–20',  'Constant tension, no swinging',          ''),
          ex('Rear Delt Cable Fly',        '4', '15–20',  'Face-away from machine',                 ''),
          ex('Barbell Upright Row',        '3', '10',     'Wide grip, elbows above wrists',         ''),
          ex('Dumbbell Front Raise',       '3', '12',     'Alternate arms, controlled descent',     ''),
          ex('Shrugs (barbell)',           '3', '12',     'Trap isolation — hold 1 sec at top',     ''),
        ],
        ['Shoulder mobility band circuit 3 min'],
        ['Doorway stretch', 'Cross-body stretch each side', 'Foam roll upper traps']),

      day('Thursday', 'Arms — Biceps & Triceps', false,
        [
          ex('EZ-Bar Curl',                '4', '8–10',   'Supinated grip, full ROM',               ''),
          ex('Incline Dumbbell Curl',      '3', '10–12',  'Stretch at bottom, squeeze at top',      ''),
          ex('Concentration Curl',         '3', '12',     'Peak contraction isolation',             ''),
          ex('Cable Curl',                 '3', '15',     'Constant tension',                       ''),
          ex('Close-Grip Bench Press',     '4', '8–10',   'Primary tricep mass builder',            ''),
          ex('Overhead Tricep Extension',  '3', '10–12',  'Long head emphasis',                     ''),
          ex('Skull Crushers',             '3', '10',     'EZ-bar, full stretch',                   ''),
          ex('Cable Pushdown (bar)',        '3', '15',     'Finishing move',                         ''),
        ],
        ['Light curls warm-up', 'Tricep pushdown warm-up'],
        ['Bicep wall stretch', 'Overhead tricep stretch', 'Wrist flexor stretch']),

      day('Friday', 'Legs — Complete Lower Body', false,
        [
          ex('Barbell Back Squat',         '5', '8–10',   'Moderate weight, feel the quads',        ''),
          ex('Hack Squat',                 '4', '10–12',  'Quad sweep emphasis',                    ''),
          ex('Leg Extension',              '4', '12–15',  'Isolation, pause at top',                ''),
          ex('Romanian Deadlift',          '4', '10',     'Hamstring stretch focus',                ''),
          ex('Leg Curl (seated)',           '4', '12',     'Seated > lying for stretch',             ''),
          ex('Walking Lunge',              '3', '16',     '8 each leg, add dumbbells',              ''),
          ex('Donkey Calf Raise',          '5', '15',     'Full range, 2-sec pause at bottom',      ''),
        ],
        ['Leg swings', 'Bodyweight squat 3×15', 'Hip mobility flow'],
        ['Quad foam roll', 'Pigeon pose', 'Hamstring PNF stretch']),

      rest('Saturday'),
      rest('Sunday'),
    ],
  },


  // ── 5. WEIGHT LOSS / FAT LOSS ──────────────────────────────────────────────────
  weightloss: {
    label: 'Fat-Loss Accelerator Program',
    level: 'Beginner–Intermediate',
    goal: 'Fat Loss & Body Recomposition',
    daysPerWeek: 5,
    weeklyVolume: 'High frequency, moderate volume, short rest (45–60 sec)',
    progressionRule: 'Track body weight and measurements weekly. Increase cardio duration by 5 min every 2 weeks.',
    schedule: [
      day('Monday', 'Full Body Circuit (A)', false,
        [
          ex('Goblet Squat',               '4', '15',      '60 sec rest, moderate weight',           ''),
          ex('Push-up (elevated if needed)','4', '15',      'Strict form, full ROM',                  ''),
          ex('Dumbbell Row',               '4', '12 / arm', 'Chest-supported or single-arm on bench', ''),
          ex('Step-up',                    '3', '12 / leg', ''),
          ex('Plank',                      '3', '45 sec',   ''),
          ex('HIIT Finisher: 10 burpees + 20 jumping jacks + 30 mountain climbers', '3', 'rounds', '60 sec rest between rounds', ''),
        ],
        ['5 min light jog or march on spot', 'Dynamic warm-up 5 min'],
        ['Static full-body stretch 8 min']),

      day('Tuesday', 'Cardio LISS + Core', false,
        [
          ex('Treadmill / Elliptical',     '1', '35–45 min', '65% max HR, fat-burning zone',         ''),
          ex('Dead Bug',                   '3', '10 / side', 'Lower back protection',                ''),
          ex('Bicycle Crunch',             '3', '20',        'Slow, controlled rotation',            ''),
          ex('Russian Twist',              '3', '20',        'Optional light plate',                 ''),
          ex('Pallof Press',               '3', '12 / side', 'Anti-rotation core',                   ''),
        ],
        ['2 min easy walk', 'Core activation drill'],
        ['Hip flexor stretch', 'Pigeon pose', 'Lower back stretch']),

      day('Wednesday', 'Full Body Circuit (B)', false,
        [
          ex('Barbell or DB Deadlift',     '4', '10',       'Hinge pattern, full ROM',               ''),
          ex('Seated Dumbbell Press',      '4', '12',       ''),
          ex('Lat Pulldown or Band Pull',  '4', '12',       ''),
          ex('Reverse Lunge',              '3', '12 / leg', 'Control descent',                       ''),
          ex('Dumbbell Bicep Curl',        '3', '15',       ''),
          ex('Tricep Dips (bench)',        '3', '15',       ''),
          ex('Cardio Finisher: Jump rope', '1', '10 min',   'Moderate pace',                         ''),
        ],
        ['5 min walk', 'Hip mobility drill'],
        ['Full body foam roll 8 min']),

      rest('Thursday'),

      day('Friday', 'Metabolic Resistance Training', false,
        [
          ex('Kettlebell Swing',           '4', '20',       'Hip power',                             ''),
          ex('Box Jump (or Squat Jump)',   '4', '8',        'Land softly, reset',                    ''),
          ex('Push Press',                 '3', '10',       'Full overhead lockout',                 ''),
          ex('TRX Row or Inverted Row',    '3', '12',       ''),
          ex('Sled Drag or Farmer Carry',  '3', '20 m',     'Core braced throughout',                ''),
          ex('Ab Wheel Rollout',           '3', '10',       ''),
        ],
        ['5 min jump rope easy', 'Joint mobility circles'],
        ['Ice pack if needed', 'Static stretch 10 min', 'Protein shake within 30 min']),

      day('Saturday', 'Active Recovery Cardio', false,
        [
          ex('Outdoor Walk / Light Jog',   '1', '40–60 min', '55–60% max HR, easy conversation',    ''),
          ex('Yoga or Light Stretching',   '1', '20 min',    ''),
        ],
        [],
        ['Gratitude journaling + sleep target: 8 hrs']),

      rest('Sunday'),
    ],
  },


  // ── 6. YOGA & MOBILITY ────────────────────────────────────────────────────────
  yoga: {
    label: 'Athletic Yoga & Mobility Program',
    level: 'All Levels',
    goal: 'Flexibility, Balance, Mind-Muscle Connection',
    daysPerWeek: 6,
    weeklyVolume: 'Daily movement, no heavy loading',
    progressionRule: 'Increase hold times by 10 sec every week. Progress to advanced variations when comfortable.',
    schedule: [
      day('Monday', 'Morning Power Flow (45 min)', false,
        [
          ex('Sun Salutation A',           '5', 'rounds',   'Link breath to movement',               'Inhale up, exhale fold'),
          ex('Sun Salutation B',           '3', 'rounds',   'Add Warrior I transitions',             ''),
          ex('Warrior I → II → III sequence', '3', '5 breaths each pose', '', ''),
          ex('Chair Pose Hold',            '4', '45 sec',   'Quads burning — breathe through it',    ''),
          ex('Boat Pose',                  '3', '30 sec',   'Core engagement',                       ''),
          ex('Crow Pose Practice',         '1', '5 min',    'Arm balance skill work',                'Look forward not down'),
        ],
        ['Neck rolls', 'Wrist circles', '5 deep breaths'],
        ['Seated forward fold 2 min', 'Supine twists 2 min each', 'Savasana 5 min']),

      day('Tuesday', 'Strength Yoga (60 min)', false,
        [
          ex('Chaturanga to Updog flow',   '5', '8 reps',   'Tricep and core strength',              ''),
          ex('Side Plank (each side)',      '3', '45 sec',   'Stack hips, extend top arm',            ''),
          ex('Warrior III Balance Hold',   '3', '30 sec / side', 'Hip stability',                   ''),
          ex('Handstand Prep (wall)',       '1', '10 min',   'Build shoulder strength',              ''),
          ex('Low Lunge to Crescent Pose', '3', '60 sec / side', 'Hip flexor + quad stretch',       ''),
          ex('Camel Pose',                 '3', '30 sec',   'Deep backbend — go slow',               ''),
        ],
        ['Joint mobility warmup 5 min'],
        ["Child's pose 3 min", 'Supine butterfly 2 min', 'Body scan meditation 5 min']),

      day('Wednesday', 'Yin Yoga — Deep Tissue Release (60 min)', false,
        [
          ex('Dragon Pose',                '2', '3 min / side', 'Hip flexor, groin — passive hold', 'Use blocks if needed'),
          ex('Sleeping Swan (Pigeon)',      '2', '3–4 min / side', 'Glute & piriformis',            ''),
          ex('Saddle Pose',                '2', '3 min',     'Quad & hip flexor',                   ''),
          ex('Caterpillar',                '1', '4 min',     'Spine, hamstrings',                   ''),
          ex('Butterfly Forward Fold',     '1', '3 min',     'Groin & inner thigh',                 ''),
          ex('Twisted Roots',              '2', '3 min / side', 'Spinal rotation',                  ''),
        ],
        ['5 deep breaths, body scan'],
        ['Savasana 10 min', 'Journaling: note areas of tightness']),

      day('Thursday', 'Core & Balance (45 min)', false,
        [
          ex('Tree Pose',                  '3', '90 sec / side', 'Focus point ahead',               ''),
          ex('Warrior III → Standing Split','3', '30 sec each',  'Hip stability progression',       ''),
          ex('Forearm Plank with hip dip', '3', '45 sec',     'Oblique activation',                 ''),
          ex('Boat Pose → Half Boat cycles','3', '10 reps',   'Lower ab focus',                     ''),
          ex('Compass Pose prep',          '2', '2 min / side', 'Hamstring flexibility',            ''),
          ex('Wheel Pose or Bridge',        '3', '30 sec',    'Full spinal extension',              ''),
        ],
        ['Cat-cow 10 reps', 'Spinal twist seated'],
        ['Legs-up-wall 5 min', 'Savasana 5 min']),

      day('Friday', 'Full Vinyasa Flow (60 min)', false,
        [
          ex('Complete Vinyasa Practice',  '1', '60 min',    'Follow online class or personal flow', 'Alo Moves, Yoga with Adriene, or DoYogaWithMe'),
        ],
        ['5 min breathwork: 4-7-8 technique'],
        ['10 min Yin cool-down', 'Meditation 5 min']),

      day('Saturday', 'Restorative Yoga (45 min)', false,
        [
          ex('Supported Fish Pose',        '1', '5 min',     'Bolster under thoracic spine',         ''),
          ex('Legs-Up-The-Wall',           '1', '7 min',     'Inversion, lymphatic drainage',        ''),
          ex('Reclined Bound Angle Pose',  '1', '5 min',     'Hips, groin, inner thigh',             ''),
          ex('Reclined Spinal Twist',      '2', '4 min / side', 'Thoracic mobility',                ''),
          ex('Savasana with pranayama',    '1', '10 min',    'Ujjayi or box breathing',              ''),
        ],
        [],
        ['Journaling + sleep target: 8–9 hrs']),

      rest('Sunday'),
    ],
  },


  // ── 7. CROSSFIT / FUNCTIONAL FITNESS ─────────────────────────────────────────
  crossfit: {
    label: 'CrossFit-Style Functional Fitness',
    level: 'Advanced',
    goal: 'Functional Strength, Power & Conditioning',
    daysPerWeek: 5,
    weeklyVolume: 'High intensity, high variability',
    progressionRule: 'Track WOD times and weights. PR attempts every 4 weeks. Scale movements before increasing load.',
    schedule: [
      day('Monday', 'Strength + Metcon (A)', false,
        [
          ex('Back Squat (strength)',      '5', '3',        '85% 1RM',                               ''),
          ex('WOD: "Cindy" (20-min AMRAP)','1', '20 min',   '5 pull-ups / 10 push-ups / 15 air squats per round', 'Score: total rounds + reps'),
          ex('Cool-down: Jump rope',       '1', '5 min',    'Easy pace',                             ''),
        ],
        ['Jump rope 5 min', 'Hip mobility', 'Shoulder prep'],
        ['PNF stretch full body', 'Foam roll']),

      day('Tuesday', 'Olympic Lifting + Core', false,
        [
          ex('Power Clean (technique)',    '6', '3',        '70% 1RM, perfect form only',            'Fast elbows, receive in quarter squat'),
          ex('Push Jerk',                  '5', '3',        '75% 1RM',                               ''),
          ex('GHD Sit-up',                 '4', '15',       'Full extension, protect lower back',    ''),
          ex('Toes-to-Bar',                '4', '10',       'Kip if needed',                         ''),
          ex('L-Sit Hold',                 '3', '20 sec',   'On parallettes or rings',               ''),
        ],
        ['PVC pipe clean drill', 'Hip hinge drill 10 reps'],
        ['Hip flexor stretch', 'Shoulder stretch']),

      day('Wednesday', 'Cardio Conditioning', false,
        [
          ex('Row Erg (concept2)',          '3', '2000m',    'Pace goal: -5 sec per 500m vs last session', ''),
          ex('Double-Unders',              '4', '50',        'Speed rope, consistent rhythm',         ''),
          ex('Running Intervals',          '6', '400m',      '90-sec rest between',                   ''),
        ],
        ['Easy row 5 min', 'Dynamic leg swings'],
        ['Easy walk', 'Calf stretch', 'IT band foam roll']),

      rest('Thursday'),

      day('Friday', 'Strength + Metcon (B)', false,
        [
          ex('Deadlift',                   '5', '3',        '85% 1RM',                               ''),
          ex('WOD: "Fran" — 21-15-9',      '1', 'for time',  'Thrusters (43/29 kg) + Pull-ups',      'Score: total time'),
          ex('Ring Dip or Dip',            '3', '10',        'Strict, controlled',                   ''),
        ],
        ['Squat mobility', 'Hip opener flow'],
        ['Full body PNF stretch', 'Ice bath if available']),

      day('Saturday', 'Team WOD / Long Conditioning', false,
        [
          ex('Partner WOD or solo AMRAP', '1', '30 min',    'Choose from benchmark list',            ''),
          ex('Benchmark: "Hero WOD" lite version or "Murph" scaled', '1', 'for time', '', ''),
        ],
        ['Long dynamic warm-up 10 min'],
        ['Protein + carbs within 30 min', 'Foam roll + stretch 15 min']),

      rest('Sunday'),
    ],
  },

};  // end WORKOUT_PROGRAMS


// ─── DIET PLANS ───────────────────────────────────────────────────────────────

const DIET_PLANS = {

  // ── 1. AGGRESSIVE BULK ────────────────────────────────────────────────────────
  aggressiveBulk: {
    label: 'Aggressive Muscle-Building Diet',
    goal: 'Maximum Hypertrophy (Calorie Surplus)',
    calories: '3200–3500 kcal',
    protein: '220–240g',
    carbs: '400–450g',
    fats: '90–100g',
    waterIntake: '4–5 litres / day',
    mealTiming: 'Every 3–3.5 hrs. Pre-workout carbs 60 min before. Post-workout protein + carbs within 30 min.',
    supplements: ['Creatine monohydrate 5g/day', 'Whey protein (2 scoops/day)', 'Mass gainer (if needed)', 'ZMA before bed', 'Omega-3 fish oil 2g/day'],
    meals: [
      { time: '6:30 AM',  description: 'Pre-Breakfast: 30g oats + 1 scoop whey + banana blended (liquid fast-absorb)' },
      { time: '7:30 AM',  description: 'Breakfast: 5 whole eggs + 2 extra whites scrambled, 3 slices whole-grain toast, 200ml whole milk, 1 orange' },
      { time: '10:30 AM', description: 'Mid-Morning: 200g Greek yogurt + 60g granola + 30g mixed nuts + 1 tbsp honey' },
      { time: '1:00 PM',  description: 'Lunch: 250g grilled chicken thigh, 200g cooked brown rice, 200g sweet potato, mixed salad with olive oil dressing' },
      { time: '3:30 PM',  description: 'Pre-Workout (60 min before): 2 slices whole wheat bread + 2 tbsp peanut butter + banana + black coffee' },
      { time: '5:30 PM',  description: 'Post-Workout: 1.5 scoops whey + 80g fast oats or white rice cakes (quick carbs)' },
      { time: '7:30 PM',  description: 'Dinner: 250g lean beef or salmon, 250g cooked pasta or quinoa, mixed roasted vegetables, 1 tbsp olive oil' },
      { time: '10:00 PM', description: 'Before Bed: 1 scoop casein protein + 200ml whole milk + 30g peanut butter' },
    ],
    notes: 'Track calories for the first 2 weeks until you can eyeball portions. Aim for 0.5–1 kg weight gain per month for clean bulk. If gaining more than 1.5 kg/month, reduce carbs by 50g. Prioritise sleep 8–9 hrs for maximum GH release.',
  },

  // ── 2. LEAN BULK ──────────────────────────────────────────────────────────────
  leanBulk: {
    label: 'Lean Bulk Diet (Recomposition)',
    goal: 'Muscle Gain with Minimal Fat',
    calories: '2700–2900 kcal',
    protein: '190–210g',
    carbs: '300–330g',
    fats: '75–85g',
    waterIntake: '3.5–4 litres / day',
    mealTiming: 'Carb cycle: high carbs on training days, moderate on rest days.',
    supplements: ['Creatine monohydrate 5g/day', 'Whey protein', 'Multivitamin', 'Vitamin D3 2000IU', 'Omega-3 2g/day'],
    meals: [
      { time: '7:00 AM',  description: 'Breakfast: 80g oats with almond milk, 1 tbsp flaxseed, 1 banana, 3 boiled eggs' },
      { time: '10:00 AM', description: 'Snack: 200g cottage cheese + 1 cup blueberries + 20g walnuts' },
      { time: '1:00 PM',  description: 'Lunch: 220g grilled chicken breast, 180g cooked brown rice, 150g broccoli, avocado ¼' },
      { time: '4:00 PM',  description: 'Pre-Workout: Banana + 1 scoop whey in water (45 min before)' },
      { time: '6:30 PM',  description: 'Post-Workout: 200g grilled salmon or chicken, 150g sweet potato, steamed green beans' },
      { time: '9:00 PM',  description: 'Evening: 200g Greek yogurt + 1 scoop casein or ½ cup low-fat milk + 15g almonds' },
    ],
    notes: 'On rest days, reduce carbs by 80–100g and replace with extra healthy fats. Weigh yourself weekly (morning, post-bathroom). Expect 0.25–0.5 kg/month gain on a lean bulk.',
  },

  // ── 3. FAT LOSS / CUT ─────────────────────────────────────────────────────────
  aggressiveCut: {
    label: 'Aggressive Fat-Loss Diet',
    goal: 'Maximum Fat Loss While Preserving Muscle',
    calories: '1700–1900 kcal',
    protein: '180–200g',
    carbs: '130–160g',
    fats: '50–60g',
    waterIntake: '4+ litres / day (suppresses hunger)',
    mealTiming: 'Intermittent fasting optional (16:8). Eat carbs around workouts only.',
    supplements: ['Whey protein isolate', 'BCAA during training', 'Green tea extract or black coffee (thermogenic)', 'L-Carnitine 2g before cardio', 'Multivitamin', 'Electrolytes'],
    meals: [
      { time: '8:00 AM',  description: 'Break fast: 4 egg whites + 1 whole egg omelette with spinach, mushrooms, bell pepper — cooked in coconut spray. Black coffee.' },
      { time: '11:00 AM', description: 'Mid-Morning: 1 scoop whey protein (water) + 10 raw almonds + cucumber slices' },
      { time: '1:30 PM',  description: 'Lunch: 200g grilled chicken breast, large mixed salad (romaine, tomato, cucumber, olives), 1 tsp olive oil + lemon dressing, ½ cup lentils' },
      { time: '4:00 PM',  description: 'Pre-Workout: ½ banana + black coffee or pre-workout (no sugar). Eat 45 min before.' },
      { time: '6:30 PM',  description: 'Post-Workout: 1.5 scoops whey in water immediately. 150g grilled tilapia or tuna, 100g steamed broccoli + asparagus' },
      { time: '8:30 PM',  description: 'Dinner: 150g lean turkey mince or white fish, large vegetable stir-fry (zero-calorie cooking spray), small portion brown rice (75g cooked)' },
    ],
    notes: 'Do NOT go below 1600 kcal — muscle loss accelerates. Weigh daily, track 7-day average. Expect 0.5–0.75 kg fat loss/week on this plan. Reintroduce 200 kcal on rest days if lifts drop significantly.',
  },

  // ── 4. MAINTENANCE + PERFORMANCE ─────────────────────────────────────────────
  maintenance: {
    label: 'Performance Maintenance Diet',
    goal: 'Sustain Weight, Optimise Energy & Recovery',
    calories: '2200–2400 kcal',
    protein: '160–180g',
    carbs: '240–270g',
    fats: '65–75g',
    waterIntake: '3–4 litres / day',
    mealTiming: 'Consistent 3–4 meal timing. Largest meals at breakfast and lunch.',
    supplements: ['Creatine monohydrate 3–5g/day', 'Omega-3 fish oil 2g', 'Vitamin D3 1000–2000IU', 'Magnesium glycinate 300mg before bed'],
    meals: [
      { time: '7:00 AM',  description: 'Breakfast: 80g oats + 250ml skimmed milk + 2 whole eggs, 1 fruit (apple or pear), black coffee' },
      { time: '10:30 AM', description: 'Mid-Morning: 200g Greek yogurt + 1 tbsp honey + 30g mixed seeds + handful of berries' },
      { time: '1:00 PM',  description: 'Lunch: 180g chicken breast or beef steak, ¾ cup brown rice, large side salad, 1 tsp olive oil' },
      { time: '4:30 PM',  description: 'Pre-Workout: 1 slice whole-grain toast + peanut butter + banana' },
      { time: '7:00 PM',  description: 'Post-Workout / Dinner: 160g salmon or chicken, 200g roasted vegetables, ½ cup quinoa' },
      { time: '9:30 PM',  description: 'Evening (optional): 1 cup low-fat milk or light casein shake if hungry' },
    ],
    notes: 'Review weight every 2 weeks. If weight creeps up, reduce carbs by 30g. If dropping, add 50g carbs to dinner. Prioritise whole foods 80% of the time — 20% flexibility keeps adherence high.',
  },

  // ── 5. VEGETARIAN HIGH-PROTEIN ────────────────────────────────────────────────
  vegetarianHighProtein: {
    label: 'Vegetarian High-Protein Plan',
    goal: 'Muscle Building Without Meat',
    calories: '2200–2500 kcal',
    protein: '150–170g',
    carbs: '260–290g',
    fats: '65–75g',
    waterIntake: '3.5 litres / day',
    mealTiming: 'Spread protein across 5–6 meals. Protein at every meal without exception.',
    supplements: ['Plant-based protein powder (pea + rice blend)', 'Creatine monohydrate (works same for vegetarians)', 'B12 supplement 1000mcg/day', 'Iron supplement (if blood tests low)', 'Zinc 25mg', 'Omega-3 (algae-based)'],
    meals: [
      { time: '7:00 AM',  description: 'Breakfast: Greek yogurt parfait — 250g full-fat Greek yogurt, 50g granola, mixed berries, 2 tbsp chia seeds, 1 scoop plant protein mixed in' },
      { time: '10:00 AM', description: 'Mid-Morning: Protein smoothie — almond milk, 1 scoop pea protein, 1 banana, 1 tbsp peanut butter, spinach handful, ice' },
      { time: '1:00 PM',  description: 'Lunch: Paneer tikka (200g paneer marinated in spices, grilled), 180g brown rice, mixed dal (lentils), large salad' },
      { time: '4:00 PM',  description: 'Pre-Workout: 2 slices whole-grain toast + 2 tbsp almond butter + drizzle of honey' },
      { time: '6:30 PM',  description: 'Post-Workout: 1.5 scoops plant protein in oat milk + 100g cottage cheese' },
      { time: '8:30 PM',  description: 'Dinner: Chickpea and kidney bean curry + 200g tofu stir-fry + quinoa 150g + roasted vegetables' },
      { time: '10:00 PM', description: 'Before Bed: 200g cottage cheese (paneer or low-fat) + 30g pumpkin seeds (casein equivalent)' },
    ],
    notes: 'Combine incomplete proteins at each meal (legumes + grains = complete amino acid profile). Get blood work every 6 months to check B12, iron, zinc. Fermented foods (yogurt, kefir) improve protein absorption.',
  },

  // ── 6. VEGAN PERFORMANCE ─────────────────────────────────────────────────────
  vegan: {
    label: 'Vegan Performance Diet',
    goal: 'Plant-Based Athletic Performance',
    calories: '2300–2600 kcal',
    protein: '140–160g',
    carbs: '300–340g',
    fats: '70–80g',
    waterIntake: '3.5–4 litres / day',
    mealTiming: 'Protein at every meal. Leucine-rich sources (soy, pea) post-workout.',
    supplements: ['Pea + rice protein blend 2 scoops/day', 'Creatine monohydrate 5g/day', 'B12 methylcobalamin 1000mcg', 'Algae-based Omega-3 (DHA/EPA)', 'Vitamin D3 from lichen', 'Iodine supplement', 'Zinc'],
    meals: [
      { time: '7:00 AM',  description: 'Breakfast: Tofu scramble (200g firm tofu, turmeric, nutritional yeast, spinach, tomatoes) + 2 slices whole-grain toast + avocado ½' },
      { time: '10:00 AM', description: 'Snack: 2 scoops vegan protein in oat milk + 1 banana + 2 tbsp almond butter' },
      { time: '1:00 PM',  description: 'Lunch: Black bean and lentil bowl (200g each), brown rice 200g, roasted sweet potato, tahini dressing, hemp seeds 2 tbsp' },
      { time: '4:00 PM',  description: 'Pre-Workout: Dates (4–5) + 1 scoop vegan protein + black coffee' },
      { time: '6:30 PM',  description: 'Post-Workout: Edamame 200g + 1.5 scoops vegan protein in water immediately after' },
      { time: '8:30 PM',  description: 'Dinner: Tempeh stir-fry (200g) + quinoa 180g + broccoli + kale + sesame oil + soy sauce' },
      { time: '10:00 PM', description: 'Before Bed: Soy milk 300ml + 1 tbsp chia seeds (slow-release protein overnight)' },
    ],
    notes: "Soy is the most complete plant protein — don't fear it. Rotate protein sources daily for full amino acid coverage. Sprouted grains and legumes improve bioavailability. Cook with cast iron to increase dietary iron.",
  },

  // ── 7. ENDURANCE ATHLETE ─────────────────────────────────────────────────────
  endurance: {
    label: 'Endurance Athlete Fuelling Plan',
    goal: 'Maximum Aerobic Performance & Recovery',
    calories: '2800–3200 kcal',
    protein: '150–170g',
    carbs: '380–420g',
    fats: '70–80g',
    waterIntake: '5+ litres / day + electrolytes during long sessions',
    mealTiming: 'Carb-load 48 hrs before race/event. Eat 200–300 kcal 60–90 min before training.',
    supplements: ['Electrolyte tablets (sodium, potassium, magnesium)', 'Maltodextrin or energy gels for sessions 60+ min', 'Omega-3 3g/day (anti-inflammation)', 'Tart cherry juice (recovery)', 'Beetroot juice 500ml before training (nitrate boost)', 'Iron if long-distance runner'],
    meals: [
      { time: '6:30 AM',  description: 'Pre-Training Snack (if early morning): Banana + 1 tbsp honey + 200ml water' },
      { time: '8:30 AM',  description: 'Post-Training Breakfast: Overnight oats (100g) + milk + banana + 2 tbsp nut butter + 1 scoop whey + blueberries' },
      { time: '11:30 AM', description: 'Mid-Morning: 2 slices whole-grain toast + tuna + avocado ½ + 200ml orange juice' },
      { time: '2:00 PM',  description: 'Lunch: Large pasta bowl (230g cooked) + 180g grilled chicken + marinara sauce + parmesan + side salad' },
      { time: '5:00 PM',  description: 'Pre-Training/Afternoon: Energy bar or banana + 500ml beetroot juice (60 min before if racing)' },
      { time: '8:00 PM',  description: 'Dinner: 180g salmon + 250g cooked white rice or sweet potato + roasted vegetables + tart cherry juice 250ml' },
      { time: '10:00 PM', description: 'Recovery: Casein protein 30g + 300ml milk + 1 tbsp honey' },
    ],
    notes: 'Carbohydrate is king for endurance. Never train fasted for sessions over 60 min. Practice your race-day nutrition during training. Sodium intake is critical — don\'t just hydrate with plain water on long runs.',
  },

  // ── 8. SENIOR / LOW-INTENSITY ─────────────────────────────────────────────────
  balanced: {
    label: 'Balanced Health-Focused Diet',
    goal: 'Long-Term Health, Energy & Joint Support',
    calories: '1900–2100 kcal',
    protein: '130–150g',
    carbs: '210–240g',
    fats: '65–75g',
    waterIntake: '2.5–3 litres / day',
    mealTiming: '3 main meals + 1–2 small snacks. No eating within 2 hrs of bedtime.',
    supplements: ['Collagen peptides 10g/day (joint support)', 'Omega-3 fish oil 2g', 'Vitamin D3 + K2', 'Magnesium glycinate 300mg before bed', 'Probiotics'],
    meals: [
      { time: '7:30 AM',  description: 'Breakfast: 2 whole eggs + 1 white scrambled, 1 slice whole-grain toast, half avocado, 150ml orange juice, green tea' },
      { time: '10:30 AM', description: 'Snack: Apple + 20g almonds + 1 small low-fat cheese wedge' },
      { time: '1:00 PM',  description: 'Lunch: Grilled fish (150g) or chicken, ½ cup brown rice, large steamed vegetables, lemon and olive oil' },
      { time: '4:00 PM',  description: 'Afternoon Snack: 150g Greek yogurt + 1 tsp honey + walnuts 15g' },
      { time: '7:00 PM',  description: 'Dinner: Lean protein (150g), roasted sweet potato ½ medium, Mediterranean salad with olives and feta' },
    ],
    notes: 'Anti-inflammatory focus: include turmeric, ginger, olive oil, and fatty fish 3x/week. Fibre target 30–35g/day from vegetables, legumes, and whole grains. Limit ultra-processed foods, added sugar, and alcohol.',
  },

};  // end DIET_PLANS


// ─── MATCHING LOGIC ───────────────────────────────────────────────────────────

/**
 * Returns program metadata (label, level, goal etc.) for a given key.
 */
export function getWorkoutMeta(key = 'general') {
  const prog = WORKOUT_PROGRAMS[key] || WORKOUT_PROGRAMS.general;
  return {
    label: prog.label,
    level: prog.level,
    goal: prog.goal,
    daysPerWeek: prog.daysPerWeek,
    weeklyVolume: prog.weeklyVolume,
    progressionRule: prog.progressionRule,
  };
}

/**
 * Returns diet plan metadata without the meals array (for compact use).
 */
export function getDietMeta(planName = '', features = []) {
  const plan = getDietRecommendation(planName, features);
  return {
    label: plan.label,
    goal: plan.goal,
    calories: plan.calories,
    waterIntake: plan.waterIntake,
    mealTiming: plan.mealTiming,
  };
}

export function getWorkoutRecommendation(specialty = '') {
  const query = specialty.toLowerCase().trim();

  const scores = {
    general:       0,
    strength:      0,
    cardio:        0,
    bodybuilding:  0,
    weightloss:    0,
    yoga:          0,
    crossfit:      0,
  };

  // Keyword scoring
  if (query.match(/general|beginner|all-round|intermediate|split/i))           scores.general += 5;
  if (query.match(/strength|powerlifting|power|strongman|heavy|1rm/i))        scores.strength += 5;
  if (query.match(/cardio|running|endurance|aerobic|conditioning|hiit/i))     scores.cardio += 5;
  if (query.match(/bodybuilding|hypertrophy|muscle|aesthetics|pump|size/i))   scores.bodybuilding += 5;
  if (query.match(/weight loss|fat loss|slim|cut|lean|burn|metabolic/i))      scores.weightloss += 5;
  if (query.match(/yoga|flexibility|mobility|balance|stretch|mindful/i))      scores.yoga += 5;
  if (query.match(/crossfit|functional|wod|olympic lifting|metcon/i))         scores.crossfit += 5;

  // Find max score
  const [bestKey] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  // Return the workout program, convert schedule array to object keyed by day for old format compatibility
  const program = WORKOUT_PROGRAMS[bestKey];
  return program.schedule;  // Still returns array, frontend expects this now
}

/**
 * Multi-signal scoring for diet selection.
 * Returns best-match diet based on plan name and features.
 */
export function getDietRecommendation(planName = '', features = []) {
  const query = `${planName} ${features.join(' ')}`.toLowerCase();

  const scores = {
    aggressiveBulk: 0,
    leanBulk: 0,
    aggressiveCut: 0,
    maintenance: 0,
    vegetarianHighProtein: 0,
    vegan: 0,
    endurance: 0,
    balanced: 0,
  };

  // Bulk scoring
  if (query.match(/bulk|mass|gain|muscle|advance|premium|heavy/i)) {
    scores.aggressiveBulk += 5;
    scores.leanBulk += 3;
  }

  // Cut scoring
  if (query.match(/cut|slim|loss|fat loss|weight loss|shred|lean/i)) {
    scores.aggressiveCut += 5;
    scores.leanBulk += 2;
  }

  // Maintenance scoring
  if (query.match(/maintenance|standard|regular|basic|sustain/i)) scores.maintenance += 5;

  // Dietary restriction scoring
  if (query.match(/vegetarian|veg|lacto/i)) scores.vegetarianHighProtein += 5;
  if (query.match(/vegan|plant|plant-based/i)) scores.vegan += 5;

  // Endurance scoring
  if (query.match(/endurance|cardio|runner|marathon|cycling|triathlon/i)) scores.endurance += 5;

  // Health/senior scoring
  if (query.match(/health|balanced|senior|joint|wellness/i)) scores.balanced += 5;

  // Find max score — fallback to maintenance if all zero
  const [bestKey] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (scores[bestKey] === 0) return DIET_PLANS.maintenance;

  return DIET_PLANS[bestKey];
}
