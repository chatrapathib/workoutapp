import { ExerciseItem, MuscleCategory } from '../types';

export const DEFAULT_EXERCISES: ExerciseItem[] = [
  // CHEST
  { id: 'bb-bench-press', name: 'Barbell Bench Press', category: 'Chest', primaryMuscle: 'Chest', secondaryMuscles: ['Triceps', 'Shoulders'] },
  { id: 'inc-bb-bench', name: 'Incline Barbell Bench Press', category: 'Chest', primaryMuscle: 'Upper Chest', secondaryMuscles: ['Triceps', 'Shoulders'] },
  { id: 'dec-bench-press', name: 'Decline Bench Press', category: 'Chest', primaryMuscle: 'Lower Chest', secondaryMuscles: ['Triceps'] },
  { id: 'db-bench-press', name: 'Dumbbell Bench Press', category: 'Chest', primaryMuscle: 'Chest', secondaryMuscles: ['Triceps', 'Shoulders'] },
  { id: 'flat-db-press', name: 'Flat Dumbbell Press', category: 'Chest', primaryMuscle: 'Chest', secondaryMuscles: ['Triceps', 'Shoulders'] },
  { id: 'db-flyes', name: 'Dumbbell Flyes', category: 'Chest', primaryMuscle: 'Chest', secondaryMuscles: [] },
  { id: 'inc-db-press', name: 'Incline Dumbbell Press', category: 'Chest', primaryMuscle: 'Upper Chest', secondaryMuscles: ['Shoulders', 'Triceps'] },
  { id: 'inc-mach-press', name: 'Incline Machine Press', category: 'Chest', primaryMuscle: 'Upper Chest', secondaryMuscles: ['Shoulders', 'Triceps'] },
  { id: 'mach-chest-press', name: 'Machine Chest Press', category: 'Chest', primaryMuscle: 'Chest', secondaryMuscles: ['Triceps', 'Shoulders'] },
  { id: 'push-ups', name: 'Push-Ups', category: 'Chest', primaryMuscle: 'Chest', secondaryMuscles: ['Triceps', 'Shoulders', 'Core'] },
  { id: 'cable-crossover', name: 'Cable Crossover', category: 'Chest', primaryMuscle: 'Chest', secondaryMuscles: [] },
  { id: 'cable-fly', name: 'Cable Fly', category: 'Chest', primaryMuscle: 'Chest', secondaryMuscles: [] },
  { id: 'chest-dips', name: 'Chest Dips', category: 'Chest', primaryMuscle: 'Lower Chest', secondaryMuscles: ['Triceps', 'Shoulders'] },
  { id: 'pec-deck', name: 'Pec Deck', category: 'Chest', primaryMuscle: 'Chest', secondaryMuscles: [] },
  { id: 'pec-deck-mach', name: 'Pec Deck Machine', category: 'Chest', primaryMuscle: 'Chest', secondaryMuscles: [] },

  // BACK
  { id: 'pull-ups', name: 'Pull-Ups', category: 'Back', primaryMuscle: 'Back/Lats', secondaryMuscles: ['Biceps'] },
  { id: 'chin-ups', name: 'Chin-Ups', category: 'Back', primaryMuscle: 'Back/Lats', secondaryMuscles: ['Biceps'] },
  { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'Back', primaryMuscle: 'Lats', secondaryMuscles: ['Biceps'] },
  { id: 'neutral-lat-pulldown', name: 'Neutral-Grip Lat Pulldown', category: 'Back', primaryMuscle: 'Lats', secondaryMuscles: ['Biceps'] },
  { id: 'bent-bb-row', name: 'Bent-Over Barbell Row', category: 'Back', primaryMuscle: 'Back', secondaryMuscles: ['Biceps', 'Rear Delts'] },
  { id: 'db-row', name: 'Dumbbell Row', category: 'Back', primaryMuscle: 'Back/Lats', secondaryMuscles: ['Biceps'] },
  { id: 'chest-sup-row', name: 'Chest-Supported Row', category: 'Back', primaryMuscle: 'Upper/Mid Back', secondaryMuscles: ['Biceps', 'Rear Delts'] },
  { id: 'chest-sup-tbar-row', name: 'Chest-Supported T-Bar or Machine Row', category: 'Back', primaryMuscle: 'Mid Back', secondaryMuscles: ['Biceps', 'Rear Delts'] },
  { id: 'mach-sup-row', name: 'Machine or Supported Row', category: 'Back', primaryMuscle: 'Mid Back', secondaryMuscles: ['Biceps', 'Rear Delts'] },
  { id: 'single-arm-cable-row', name: 'Single-Arm Cable Row', category: 'Back', primaryMuscle: 'Lats', secondaryMuscles: ['Biceps'] },
  { id: 'seated-cable-row', name: 'Seated Cable Row', category: 'Back', primaryMuscle: 'Mid Back', secondaryMuscles: ['Biceps'] },
  { id: 't-bar-row', name: 'T-Bar Row', category: 'Back', primaryMuscle: 'Back', secondaryMuscles: ['Biceps'] },
  { id: 'cable-pullover', name: 'Cable Pullover', category: 'Back', primaryMuscle: 'Lats', secondaryMuscles: ['Triceps', 'Chest'] },
  { id: 'deadlift', name: 'Deadlift', category: 'Back', primaryMuscle: 'Back/Posterior Chain', secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'] },
  { id: 'face-pull', name: 'Face Pull', category: 'Back', primaryMuscle: 'Rear Delts/Upper Back', secondaryMuscles: ['Traps'] },
  { id: 'hyperextensions', name: 'Hyperextensions', category: 'Back', primaryMuscle: 'Lower Back', secondaryMuscles: ['Glutes', 'Hamstrings'] },

  // SHOULDERS
  { id: 'oh-bb-press', name: 'Overhead Barbell Press', category: 'Shoulders', primaryMuscle: 'Shoulders', secondaryMuscles: ['Triceps', 'Upper Chest'] },
  { id: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', category: 'Shoulders', primaryMuscle: 'Shoulders', secondaryMuscles: ['Triceps'] },
  { id: 'arnold-press', name: 'Arnold Press', category: 'Shoulders', primaryMuscle: 'Shoulders', secondaryMuscles: ['Triceps'] },
  { id: 'lateral-raise', name: 'Lateral Raise', category: 'Shoulders', primaryMuscle: 'Side Delts', secondaryMuscles: ['Traps'] },
  { id: 'cable-lateral-raise', name: 'Cable Lateral Raise', category: 'Shoulders', primaryMuscle: 'Side Delts', secondaryMuscles: ['Traps'] },
  { id: 'front-raise', name: 'Front Raise', category: 'Shoulders', primaryMuscle: 'Front Delts', secondaryMuscles: [] },
  { id: 'rear-delt-flye', name: 'Rear Delt Flye', category: 'Shoulders', primaryMuscle: 'Rear Delts', secondaryMuscles: ['Upper Back'] },
  { id: 'reverse-pec-deck', name: 'Reverse Pec Deck', category: 'Shoulders', primaryMuscle: 'Rear Delts', secondaryMuscles: ['Upper Back', 'Traps'] },
  { id: 'upright-row', name: 'Upright Row', category: 'Shoulders', primaryMuscle: 'Shoulders/Traps', secondaryMuscles: ['Biceps'] },
  { id: 'shrugs', name: 'Shrugs', category: 'Shoulders', primaryMuscle: 'Traps', secondaryMuscles: ['Forearms'] },

  // ARMS - BICEPS
  { id: 'barbell-curl', name: 'Barbell Curl', category: 'Arms - Biceps', primaryMuscle: 'Biceps', secondaryMuscles: ['Forearms'] },
  { id: 'dumbbell-curl', name: 'Dumbbell Curl', category: 'Arms - Biceps', primaryMuscle: 'Biceps', secondaryMuscles: ['Forearms'] },
  { id: 'inc-db-curl', name: 'Incline Dumbbell Curl', category: 'Arms - Biceps', primaryMuscle: 'Biceps', secondaryMuscles: ['Forearms'] },
  { id: 'hammer-curl', name: 'Hammer Curl', category: 'Arms - Biceps', primaryMuscle: 'Biceps/Forearms', secondaryMuscles: ['Forearms'] },
  { id: 'preacher-curl', name: 'Preacher Curl', category: 'Arms - Biceps', primaryMuscle: 'Biceps', secondaryMuscles: [] },
  { id: 'bayesian-cable-curl', name: 'Bayesian Cable Curl', category: 'Arms - Biceps', primaryMuscle: 'Biceps', secondaryMuscles: [] },
  { id: 'concentration-curl', name: 'Concentration Curl', category: 'Arms - Biceps', primaryMuscle: 'Biceps', secondaryMuscles: [] },
  { id: 'cable-curl', name: 'Cable Curl', category: 'Arms - Biceps', primaryMuscle: 'Biceps', secondaryMuscles: ['Forearms'] },

  // ARMS - TRICEPS
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', category: 'Arms - Triceps', primaryMuscle: 'Triceps', secondaryMuscles: [] },
  { id: 'triceps-pushdown', name: 'Triceps Pushdown', category: 'Arms - Triceps', primaryMuscle: 'Triceps', secondaryMuscles: [] },
  { id: 'skull-crushers', name: 'Skull Crushers', category: 'Arms - Triceps', primaryMuscle: 'Triceps', secondaryMuscles: [] },
  { id: 'oh-tricep-ext', name: 'Overhead Tricep Extension', category: 'Arms - Triceps', primaryMuscle: 'Triceps', secondaryMuscles: [] },
  { id: 'oh-cable-tricep-ext', name: 'Overhead Cable Tricep Extension', category: 'Arms - Triceps', primaryMuscle: 'Triceps', secondaryMuscles: [] },
  { id: 'close-grip-bench', name: 'Close-Grip Bench Press', category: 'Arms - Triceps', primaryMuscle: 'Triceps', secondaryMuscles: ['Chest', 'Shoulders'] },
  { id: 'triceps-dips', name: 'Triceps Dips', category: 'Arms - Triceps', primaryMuscle: 'Triceps', secondaryMuscles: ['Chest', 'Shoulders'] },
  { id: 'kickbacks', name: 'Kickbacks', category: 'Arms - Triceps', primaryMuscle: 'Triceps', secondaryMuscles: [] },

  // FOREARMS
  { id: 'wrist-curl', name: 'Wrist Curl', category: 'Forearms', primaryMuscle: 'Forearms', secondaryMuscles: [] },
  { id: 'rev-wrist-curl', name: 'Reverse Wrist Curl', category: 'Forearms', primaryMuscle: 'Forearms', secondaryMuscles: [] },
  { id: 'farmers-carry', name: "Farmer's Carry", category: 'Forearms', primaryMuscle: 'Forearms', secondaryMuscles: ['Grip', 'Traps', 'Core'] },

  // LEGS - QUADS
  { id: 'bb-back-squat', name: 'Barbell Back Squat', category: 'Legs - Quads', primaryMuscle: 'Quads', secondaryMuscles: ['Glutes', 'Hamstrings'] },
  { id: 'front-squat', name: 'Front Squat', category: 'Legs - Quads', primaryMuscle: 'Quads', secondaryMuscles: ['Core', 'Upper Back'] },
  { id: 'leg-press', name: 'Leg Press', category: 'Legs - Quads', primaryMuscle: 'Quads', secondaryMuscles: ['Glutes', 'Hamstrings'] },
  { id: 'hack-squat', name: 'Hack Squat or Leg Press', category: 'Legs - Quads', primaryMuscle: 'Quads', secondaryMuscles: ['Glutes'] },
  { id: 'leg-extension', name: 'Leg Extension', category: 'Legs - Quads', primaryMuscle: 'Quads', secondaryMuscles: [] },
  { id: 'walking-lunges', name: 'Walking Lunges', category: 'Legs - Quads', primaryMuscle: 'Quads', secondaryMuscles: ['Glutes', 'Hamstrings'] },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', category: 'Legs - Quads', primaryMuscle: 'Quads', secondaryMuscles: ['Glutes'] },
  { id: 'goblet-squat', name: 'Goblet Squat', category: 'Legs - Quads', primaryMuscle: 'Quads', secondaryMuscles: ['Glutes', 'Core'] },

  // LEGS - HAMSTRINGS/GLUTES
  { id: 'rdl', name: 'Romanian Deadlift', category: 'Legs - Hamstrings/Glutes', primaryMuscle: 'Hamstrings', secondaryMuscles: ['Glutes', 'Lower Back'] },
  { id: 'leg-curl', name: 'Leg Curl', category: 'Legs - Hamstrings/Glutes', primaryMuscle: 'Hamstrings', secondaryMuscles: [] },
  { id: 'hip-thrust', name: 'Hip Thrust', category: 'Legs - Hamstrings/Glutes', primaryMuscle: 'Glutes', secondaryMuscles: ['Hamstrings'] },
  { id: 'glute-bridge', name: 'Glute Bridge', category: 'Legs - Hamstrings/Glutes', primaryMuscle: 'Glutes', secondaryMuscles: [] },
  { id: 'good-mornings', name: 'Good Mornings', category: 'Legs - Hamstrings/Glutes', primaryMuscle: 'Hamstrings', secondaryMuscles: ['Lower Back', 'Glutes'] },
  { id: 'cable-kickback', name: 'Cable Kickback', category: 'Legs - Hamstrings/Glutes', primaryMuscle: 'Glutes', secondaryMuscles: [] },

  // LEGS - CALVES
  { id: 'standing-calf-raise', name: 'Standing Calf Raise', category: 'Legs - Calves', primaryMuscle: 'Calves', secondaryMuscles: [] },
  { id: 'calf-raise', name: 'Calf Raise', category: 'Legs - Calves', primaryMuscle: 'Calves', secondaryMuscles: [] },
  { id: 'seated-calf-raise', name: 'Seated Calf Raise', category: 'Legs - Calves', primaryMuscle: 'Calves', secondaryMuscles: [] },
  { id: 'donkey-calf-raise', name: 'Donkey Calf Raise', category: 'Legs - Calves', primaryMuscle: 'Calves', secondaryMuscles: [] },

  // CORE / ABS
  { id: 'plank', name: 'Plank', category: 'Core / Abs', primaryMuscle: 'Core', secondaryMuscles: ['Full Abdominal Wall', 'Shoulders'] },
  { id: 'crunches', name: 'Crunches', category: 'Core / Abs', primaryMuscle: 'Upper Abs', secondaryMuscles: [] },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', category: 'Core / Abs', primaryMuscle: 'Lower Abs', secondaryMuscles: ['Hip Flexors', 'Grip'] },
  { id: 'russian-twist', name: 'Russian Twist', category: 'Core / Abs', primaryMuscle: 'Obliques', secondaryMuscles: ['Core'] },
  { id: 'cable-woodchopper', name: 'Cable Woodchopper', category: 'Core / Abs', primaryMuscle: 'Obliques', secondaryMuscles: ['Core'] },
  { id: 'sit-ups', name: 'Sit-Ups', category: 'Core / Abs', primaryMuscle: 'Abs', secondaryMuscles: ['Hip Flexors'] },
  { id: 'ab-wheel-rollout', name: 'Ab Wheel Rollout', category: 'Core / Abs', primaryMuscle: 'Core', secondaryMuscles: ['Shoulders', 'Lats'] },
  { id: 'bicycle-crunch', name: 'Bicycle Crunch', category: 'Core / Abs', primaryMuscle: 'Abs/Obliques', secondaryMuscles: ['Hip Flexors'] },

  // FULL BODY / COMPOUND
  { id: 'clean-and-jerk', name: 'Clean and Jerk', category: 'Full Body / Compound', primaryMuscle: 'Full Body', secondaryMuscles: ['Legs', 'Back', 'Shoulders'] },
  { id: 'snatch', name: 'Snatch', category: 'Full Body / Compound', primaryMuscle: 'Full Body', secondaryMuscles: ['Legs', 'Back', 'Shoulders'] },
  { id: 'kettlebell-swing', name: 'Kettlebell Swing', category: 'Full Body / Compound', primaryMuscle: 'Full Body', secondaryMuscles: ['Glutes', 'Hamstrings', 'Core', 'Shoulders'] },
  { id: 'burpees', name: 'Burpees', category: 'Full Body / Compound', primaryMuscle: 'Full Body', secondaryMuscles: ['Chest', 'Legs', 'Core'] },
  { id: 'thrusters', name: 'Thrusters', category: 'Full Body / Compound', primaryMuscle: 'Full Body', secondaryMuscles: ['Quads', 'Shoulders', 'Triceps'] },
  { id: 'turkish-get-up', name: 'Turkish Get-Up', category: 'Full Body / Compound', primaryMuscle: 'Full Body', secondaryMuscles: ['Core', 'Shoulders', 'Legs'] },

  // CARDIO
  { id: 'running', name: 'Running', category: 'Cardio', primaryMuscle: 'Cardio', secondaryMuscles: ['Legs', 'Core'] },
  { id: 'rowing-machine', name: 'Rowing Machine', category: 'Cardio', primaryMuscle: 'Cardio', secondaryMuscles: ['Back', 'Legs', 'Arms'] },
  { id: 'jump-rope', name: 'Jump Rope', category: 'Cardio', primaryMuscle: 'Cardio', secondaryMuscles: ['Calves', 'Shoulders'] },
  { id: 'cycling', name: 'Cycling', category: 'Cardio', primaryMuscle: 'Cardio', secondaryMuscles: ['Quads', 'Glutes'] },
  { id: 'stair-climber', name: 'Stair Climber', category: 'Cardio', primaryMuscle: 'Cardio', secondaryMuscles: ['Glutes', 'Quads', 'Calves'] },
];

export const DEFAULT_RAW_SPLIT_TEXT = `PUSH A — CHEST PRIORITY
========================================

1. Machine Chest Press
   3 sets × 6–10 reps

2. Incline Dumbbell Press
   3 sets × 8–12 reps

3. Cable Fly
   2 sets × 10–15 reps

4. Cable Lateral Raise
   3 sets × 12–20 reps

5. Tricep Pushdown
   3 sets × 8–12 reps

6. Overhead Cable Tricep Extension
   2 sets × 10–15 reps

Total: 16 sets

========================================
PULL A — BACK + BICEPS
========================================

1. Chest-Supported Row
   3 sets × 6–10 reps

2. Lat Pulldown
   3 sets × 8–12 reps

3. Machine or Supported Row
   2 sets × 10–12 reps

4. Cable Pullover
   2 sets × 10–15 reps

5. Incline Dumbbell Curl
   3 sets × 8–12 reps

6. Hammer Curl
   2 sets × 10–15 reps

========================================
LEGS A — LOW FATIGUE
========================================

1. Leg Press
   3 sets × 8–12 reps

2. Romanian Deadlift
   2 sets × 8–12 reps

3. Leg Curl
   3 sets × 10–15 reps

4. Calf Raise
   3 sets × 10–15 reps

Total: 11 sets

========================================
PUSH B — UPPER CHEST + ARMS
========================================

1. Incline Machine Press
   3 sets × 6–10 reps

2. Flat Dumbbell Press
   2 sets × 8–12 reps

3. Pec Deck
   3 sets × 10–15 reps

4. Lateral Raise
   3 sets × 12–20 reps

5. Overhead Tricep Extension
   3 sets × 8–12 reps

6. Tricep Pushdown
   2 sets × 10–15 reps

========================================
PULL B — BACK + ARM PRIORITY
========================================

1. Neutral-Grip Lat Pulldown
   3 sets × 8–12 reps

2. Chest-Supported T-Bar or Machine Row
   3 sets × 8–12 reps

3. Single-Arm Cable Row
   2 sets × 10–15 reps

4. Reverse Pec Deck
   2 sets × 12–20 reps

5. Preacher Curl
   3 sets × 8–12 reps

6. Bayesian Cable Curl
   3 sets × 10–15 reps

7. Hammer Curl
   2 sets × 10–15 reps

========================================
LEGS B — LOW FATIGUE
========================================

1. Hack Squat or Leg Press
   3 sets × 8–12 reps

2. Leg Curl
   3 sets × 10–15 reps

3. Leg Extension
   2 sets × 12–15 reps

4. Calf Raise
   3 sets × 10–15 reps`;
