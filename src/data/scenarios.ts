import type { DisasterId, DisasterScenario } from '../types/game';

export const EDUCATIONAL_DISCLAIMER =
  'Disaster Dash is an educational simulation designed to teach general disaster awareness. It is not live emergency advice. Always follow local emergency authorities and official safety instructions.';

export const DISASTER_SCENARIOS: Record<DisasterId, DisasterScenario> = {
  earthquake: {
    id: 'earthquake',
    title: 'Earthquake',
    subtitle: 'Quake at Cedar Ridge Library',
    description:
      'Floorboards jolt and tall oak bookshelves begin to sway inside a crowded two-story civic library. Navigate three critical moments from initial tremor to open ground.',
    calmDescription:
      'A gentle simulation inside a two-story library during a tremor. Take your time to choose safe actions.',
    accentColor: '#D97706',
    completionBonus: 200,
    stages: [
      {
        id: 'eq-stage-1',
        stageNumber: 1,
        locationName: 'Main Reading Hall',
        sceneKey: 'eq_library',
        introDurationMs: 2800,
        calmIntroDurationMs: 2000,
        timerSeconds: 20,
        establishingText:
          'A deep rumble vibrates the floorboards as tall oak bookshelves begin to sway.',
        calmEstablishingText: 'The library floor begins to shake and books shift on high shelves.',
        prompt: 'The hall jolts violently. Choose your immediate move.',
        calmPrompt: 'The room is shaking near tall shelves and glass. Pick your next move.',
        safetyPrinciple: 'Drop, Cover, and Hold On under sturdy furniture away from glass and tall shelves.',
        options: [
          {
            id: 'eq-1-a',
            shortLabel: 'Take cover under oak table',
            hoverDescription: 'Drop low on hands and knees beneath the solid study table and shield your head.',
            actionIcon: 'shield',
            label:
              'Drop to your hands and knees, crawl under the solid oak study table away from windows, and shield your head and neck.',
            calmLabel: 'Drop low under the solid oak table away from windows and cover your head.',
            isCorrect: true,
            feedbackTitle: 'Protected Under Cover',
            explanation:
              'Dropping low prevents falls while a sturdy oak table shields you from falling books, ceiling tiles, and shattering glass.',
            outcomePose: 'crouch_cover',
            failureHazard: 'none',
          },
          {
            id: 'eq-1-b',
            shortLabel: 'Run to glass exit doors',
            hoverDescription: 'Sprint across the reading hall toward the tall glass doors leading to the street.',
            actionIcon: 'door',
            label:
              'Sprint across the reading hall toward the tall glass entrance doors to reach the street before shaking worsens.',
            calmLabel: 'Run toward the tall glass entrance doors to get outside immediately.',
            isCorrect: false,
            feedbackTitle: 'Shattering Glass Hazard',
            explanation:
              'Running during active shaking makes you likely to fall, and exterior glass doors frequently shatter inward during strong tremors.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'shattering_glass',
          },
          {
            id: 'eq-1-c',
            shortLabel: 'Brace inside doorway',
            hoverDescription: 'Stand upright inside the archival room doorway and hold onto the wooden frame.',
            actionIcon: 'building',
            label:
              'Stand upright inside the archival room doorway and brace both hands against the wooden frame.',
            calmLabel: 'Stand inside the open doorway and brace against the frame.',
            isCorrect: false,
            feedbackTitle: 'Swinging Door & Plaster Collapse',
            explanation:
              'Modern doorways are no stronger than adjacent walls and leave you exposed to heavy swinging doors and falling ceiling plaster.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'falling_debris',
          },
          {
            id: 'eq-1-d',
            shortLabel: 'Climb onto reading booth',
            hoverDescription: 'Step up onto the top of a tall reading booth above floor-level clutter.',
            actionIcon: 'arrow_up',
            label:
              'Climb onto the top of a tall reading booth so falling books stay on the floor beneath your feet.',
            calmLabel: 'Climb onto a tall reading booth above the floor.',
            isCorrect: false,
            feedbackTitle: 'Toppling Furniture Fall',
            explanation:
              'Elevated furniture can tip over during lateral ground motion, causing falls and leaving you exposed to overhead fixtures.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'toppling_shelf',
          },
        ],
      },
      {
        id: 'eq-stage-2',
        stageNumber: 2,
        locationName: 'Second-Floor Mezzanine',
        sceneKey: 'eq_mezzanine',
        introDurationMs: 2600,
        calmIntroDurationMs: 1900,
        timerSeconds: 20,
        establishingText:
          'You reach the second-floor mezzanine as dust drifts beneath flickering exit lights.',
        calmEstablishingText:
          'The shaking pauses on the second floor. You need to reach the ground exit.',
        prompt: 'An aftershock could strike anytime. How do you descend?',
        calmPrompt: 'You need to go downstairs safely after the shaking pauses.',
        safetyPrinciple: 'Evacuate using stairs with a handrail after shaking stops—never use elevators.',
        options: [
          {
            id: 'eq-2-a',
            shortLabel: 'Use the elevator',
            hoverDescription: 'Press the glowing call button to ride the elevator straight to the lobby.',
            actionIcon: 'elevator',
            label:
              'Press the elevator call button since the lobby indicator is still lit and it reaches the ground floor fastest.',
            calmLabel: 'Take the elevator down because its indicator light is still on.',
            isCorrect: false,
            feedbackTitle: 'Elevator Entrapment',
            explanation:
              'Power loss or shaft misalignment during aftershocks can jam elevators between floors or damage cables, trapping occupants inside.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'elevator_trap',
          },
          {
            id: 'eq-2-b',
            shortLabel: 'Take the concrete stairs',
            hoverDescription: 'Walk down the concrete stairwell while gripping the handrail and watching for debris.',
            actionIcon: 'stairs',
            label:
              'Walk carefully down the concrete stairwell, keeping one hand on the handrail and watching for cracked plaster or debris.',
            calmLabel: 'Use the concrete stairs slowly while holding the handrail and watching your step.',
            isCorrect: true,
            feedbackTitle: 'Controlled Stairwell Egress',
            explanation:
              'Stairwells allow controlled evacuation without relying on electrical systems, and holding the handrail protects your balance.',
            outcomePose: 'climb_stairs',
            failureHazard: 'none',
          },
          {
            id: 'eq-2-c',
            shortLabel: 'Drop from the balcony',
            hoverDescription: 'Vault over the mezzanine railing toward the bushes outside the lower level.',
            actionIcon: 'wind',
            label:
              'Vault over the second-floor mezzanine railing and drop onto the decorative shrubs below.',
            calmLabel: 'Jump from the second-floor balcony into the shrubs below.',
            isCorrect: false,
            feedbackTitle: 'High-Impact Fall Injury',
            explanation:
              'Jumping from upper stories risks severe fractures and head trauma from hidden concrete planters beneath shrubs.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'balcony_fall',
          },
          {
            id: 'eq-2-d',
            shortLabel: 'Wait by brick wall',
            hoverDescription: 'Pause beside the brick chimney wall in the mezzanine until staff arrive.',
            actionIcon: 'hand',
            label:
              'Wait beside the cracked brick chimney wall in the mezzanine until a staff member arrives to check the building.',
            calmLabel: 'Stay inside beside the cracked brick wall until someone arrives.',
            isCorrect: false,
            feedbackTitle: 'Masonry Collapse in Aftershock',
            explanation:
              'Damaged unreinforced brick walls and chimneys are highly unstable and frequently collapse during aftershocks.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'falling_debris',
          },
        ],
      },
      {
        id: 'eq-stage-3',
        stageNumber: 3,
        locationName: 'Civic Courtyard',
        sceneKey: 'eq_courtyard',
        introDurationMs: 2600,
        calmIntroDurationMs: 1900,
        timerSeconds: 20,
        establishingText:
          'Stepping outside, swaying utility lines crackle near the curb as an aftershock rumbles.',
        calmEstablishingText:
          'You step outside near buildings and power lines. An open lawn lies ahead.',
        prompt: 'Facade tiles loosen behind you and wires sway. Where do you wait?',
        calmPrompt: 'Where should you move to wait outside away from walls and wires?',
        safetyPrinciple: 'Move to a wide open area well clear of buildings, glass facades, trees, and power lines.',
        options: [
          {
            id: 'eq-3-a',
            shortLabel: 'Stand under entrance awning',
            hoverDescription: 'Shelter directly beneath the concrete awning over the library doorway.',
            actionIcon: 'building',
            label:
              'Take shelter directly beneath the concrete entrance awning of the library to stay out of falling dust.',
            calmLabel: 'Stand directly under the concrete library entrance awning.',
            isCorrect: false,
            feedbackTitle: 'Falling Facade Masonry',
            explanation:
              'Building perimeters and entrance awnings sit directly beneath shattering upper-floor glass and falling parapet concrete.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'falling_debris',
          },
          {
            id: 'eq-3-b',
            shortLabel: 'Warn near power line',
            hoverDescription: 'Walk close to the sagging utility line by the curb to wave cyclists back.',
            actionIcon: 'zap',
            label:
              'Walk up to the sagging power line by the streetlamp to wave oncoming cyclists away from the curb.',
            calmLabel: 'Walk near the sagging power line by the curb to warn cyclists.',
            isCorrect: false,
            feedbackTitle: 'Energized Power Line Danger',
            explanation:
              'Downed or sagging utility wires can remain live and energize surrounding pavement; keep far back and warn from a distance.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'electric_arc',
          },
          {
            id: 'eq-3-c',
            shortLabel: 'Move to open lawn',
            hoverDescription: 'Cross over to the wide grassy park lawn well clear of buildings and poles.',
            actionIcon: 'shield',
            label:
              'Move steadily across to the open grassy park lawn well clear of buildings, trees, and overhead utility wires.',
            calmLabel: 'Move to the open grassy lawn far from buildings and power lines.',
            isCorrect: true,
            feedbackTitle: 'Safe Open Assembly Area',
            explanation:
              'An open space clear of structures, utility poles, and trees removes the risk of falling masonry, glass, and live wires.',
            outcomePose: 'celebrate',
            failureHazard: 'none',
          },
          {
            id: 'eq-3-d',
            shortLabel: 'Wait inside parked car',
            hoverDescription: 'Get inside the compact car parked directly against the four-story brick wall.',
            actionIcon: 'car',
            label:
              'Climb inside your compact car parked right against the four-story brick library wall and lock the doors.',
            calmLabel: 'Sit inside a car parked right next to the four-story brick wall.',
            isCorrect: false,
            feedbackTitle: 'Crushed Vehicle Zone',
            explanation:
              'Passenger cars parked directly beside multi-story walls cannot withstand heavy falling brick or concrete panels.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'falling_debris',
          },
        ],
      },
    ],
  },

  flood: {
    id: 'flood',
    title: 'Flood',
    subtitle: 'Flash Flood on Riverbend Avenue',
    description:
      'Heavy storm runoff overwhelms city drains and turns a sloped avenue into a rushing channel. Guide your survivor from street level to safe high ground.',
    calmDescription:
      'A calm walkthrough of rising storm water on a sloped street. Take time to pick safe high ground.',
    accentColor: '#0284C7',
    completionBonus: 200,
    stages: [
      {
        id: 'fl-stage-1',
        stageNumber: 1,
        locationName: 'Riverbend Underpass',
        sceneKey: 'fl_underpass',
        introDurationMs: 2800,
        calmIntroDurationMs: 2000,
        timerSeconds: 20,
        establishingText:
          'Storm drains overflow and murky floodwater climbs rapidly beside a stalled sedan.',
        calmEstablishingText: 'Rain pours down and water rises around the stalled car on the sloped road.',
        prompt: 'Swift water is rising around the stalled car. What do you do?',
        calmPrompt: 'Water is rising around the car. Choose your next move.',
        safetyPrinciple: 'Abandon stalled vehicles in rising floodwater and move immediately to higher ground.',
        options: [
          {
            id: 'fl-1-a',
            shortLabel: 'Drive through the water',
            hoverDescription: 'Get back inside the sedan and rev the engine to push past the flooded dip.',
            actionIcon: 'car',
            label:
              'Stay locked inside the sedan and rev the engine hard to try powering through the deepening underpass.',
            calmLabel: 'Stay inside the car and try driving through the deepening water.',
            isCorrect: false,
            feedbackTitle: 'Submerged & Swept Vehicle',
            explanation:
              'Just two feet of moving water can lift and carry away most vehicles, trapping passengers inside a flooded cabin.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'swept_water',
          },
          {
            id: 'fl-1-b',
            shortLabel: 'Climb uphill to high ground',
            hoverDescription: 'Leave the stalled car and walk up the raised sidewalk toward higher terrain.',
            actionIcon: 'arrow_up',
            label:
              'Abandon the stalled car immediately and walk uphill along the raised sidewalk toward higher terrain.',
            calmLabel: 'Leave the car right away and walk uphill to higher ground.',
            isCorrect: true,
            feedbackTitle: 'Reached Higher Elevation',
            explanation:
              'Leaving a stalled vehicle early and climbing toward higher ground keeps you ahead of deepening currents and floating hazards.',
            outcomePose: 'walk',
            failureHazard: 'none',
          },
          {
            id: 'fl-1-c',
            shortLabel: 'Wade across intersection',
            hoverDescription: 'Walk straight through the rushing street water toward the store awning opposite.',
            actionIcon: 'waves',
            label:
              'Wade straight across the flooded intersection toward the convenience store awning on the far curb.',
            calmLabel: 'Walk straight across the rushing water in the middle of the intersection.',
            isCorrect: false,
            feedbackTitle: 'Swept by Hidden Current',
            explanation:
              'Six inches of fast-moving water can knock an adult off balance, and muddy water hides washed-out pavement and open drains.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'swept_water',
          },
          {
            id: 'fl-1-d',
            shortLabel: 'Shelter behind bumper',
            hoverDescription: 'Crouch behind the car bumper to block the force of the incoming runoff.',
            actionIcon: 'shield',
            label:
              'Crouch directly behind the car bumper to use the vehicle as a windbreak against the rushing current.',
            calmLabel: 'Crouch behind the car bumper to block the water flow.',
            isCorrect: false,
            feedbackTitle: 'Shifting Vehicle Impact',
            explanation:
              'Buoyant water can shift or spin a stalled vehicle suddenly, pinning or knocking down anyone sheltering beside it.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'swept_water',
          },
        ],
      },
      {
        id: 'fl-stage-2',
        stageNumber: 2,
        locationName: 'Hilltop Apartment Lobby',
        sceneKey: 'fl_lobby',
        introDurationMs: 2600,
        calmIntroDurationMs: 1900,
        timerSeconds: 20,
        establishingText:
          'Inside the hilltop lobby, dark water seeps across the tiles toward humming outlets.',
        calmEstablishingText:
          'Water pools on the ground-floor lobby near wall outlets. Stairs and a basement are nearby.',
        prompt: 'Water creeps toward energized outlets. Where do you move?',
        calmPrompt: 'Water is spreading near wall outlets on the ground floor. Where should you go?',
        safetyPrinciple: 'Avoid floodwater near electrical hazards and move upward to an upper floor.',
        options: [
          {
            id: 'fl-2-a',
            shortLabel: 'Unplug the machine',
            hoverDescription: 'Step into the puddle to pull the humming vending machine cord from the wall.',
            actionIcon: 'zap',
            label:
              'Step into the ankle-deep puddle to unplug the humming vending machine cord before water reaches the socket.',
            calmLabel: 'Walk into the puddle to unplug the humming vending machine.',
            isCorrect: false,
            feedbackTitle: 'Electrical Shock in Standing Water',
            explanation:
              'Standing in floodwater while touching energized cords or outlets can cause fatal electrocution.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'electric_arc',
          },
          {
            id: 'fl-2-b',
            shortLabel: 'Enter basement room',
            hoverDescription: 'Go down into the concrete basement storage room behind the heavy steel door.',
            actionIcon: 'door',
            label:
              'Head down into the concrete basement storage room because the heavy steel door blocks outside rain.',
            calmLabel: 'Go down into the basement storage room behind the heavy steel door.',
            isCorrect: false,
            feedbackTitle: 'Rapid Basement Flooding',
            explanation:
              'Below-grade rooms fill rapidly from water seepage and backed-up drains, creating deadly entrapment.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'submerged_room',
          },
          {
            id: 'fl-2-c',
            shortLabel: 'Climb interior stairs',
            hoverDescription: 'Avoid the wet outlets and walk up the dry concrete stairs to an upper floor.',
            actionIcon: 'stairs',
            label:
              'Avoid the pooled water near outlets and climb the dry interior concrete stairs to an upper floor above flood levels.',
            calmLabel: 'Stay clear of wet outlets and climb the interior stairs to an upper floor.',
            isCorrect: true,
            feedbackTitle: 'Safe Above Flood Level',
            explanation:
              'Ascending interior stairs keeps you dry, above rising water levels, and safely isolated from energized ground-floor wiring.',
            outcomePose: 'climb_stairs',
            failureHazard: 'none',
          },
          {
            id: 'fl-2-d',
            shortLabel: 'Wait on lobby sofa',
            hoverDescription: 'Sit on the cushioned lobby sofa with your feet lifted above the floor puddle.',
            actionIcon: 'hand',
            label:
              'Sit on top of the cushioned lobby sofa with your feet lifted up until the storm passes.',
            calmLabel: 'Wait on the lobby sofa on the ground floor with your feet up.',
            isCorrect: false,
            feedbackTitle: 'Trapped by Rising Indoor Water',
            explanation:
              'Flash flood depths can rise several feet within minutes, submerging ground-floor furniture and blocking exits.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'submerged_room',
          },
        ],
      },
      {
        id: 'fl-stage-3',
        stageNumber: 3,
        locationName: 'Upper Roofline Terrace',
        sceneKey: 'fl_terrace',
        introDurationMs: 2600,
        calmIntroDurationMs: 1900,
        timerSeconds: 20,
        establishingText:
          'On the upper terrace, an orange rescue boat patrols the flooded street two floors below.',
        calmEstablishingText:
          'You are on the upper terrace above the water while rescue crews scan the street.',
        prompt: 'Emergency crews are scanning the block. How do you respond?',
        calmPrompt: 'You are safely above the floodwater. How should you wait for rescue?',
        safetyPrinciple: 'Stay on dry high ground away from lightning masts, signal responders, and wait for official clearance.',
        options: [
          {
            id: 'fl-3-a',
            shortLabel: 'Climb down gutter',
            hoverDescription: 'Use the exterior rain pipe to climb back down to the receding street water.',
            actionIcon: 'arrow_up',
            label:
              'Climb down the exterior rain gutter into the receding street water to try walking home before dark.',
            calmLabel: 'Climb down the gutter into the street water to walk home early.',
            isCorrect: false,
            feedbackTitle: 'Contaminated Swift Water Hazard',
            explanation:
              'Receding floodwater remains swift, conceals submerged debris and downed power lines, and carries hazardous contamination.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'swept_water',
          },
          {
            id: 'fl-3-b',
            shortLabel: 'Signal from shelter',
            hoverDescription: 'Stand beneath the terrace canopy away from the metal mast and wave a bright cloth.',
            actionIcon: 'eye',
            label:
              'Stand under the sheltered terrace away from the tall metal antenna mast, wave a bright cloth to signal responders, and wait for clearance.',
            calmLabel: 'Wait under shelter away from metal poles and wave a bright cloth to signal rescuers.',
            isCorrect: true,
            feedbackTitle: 'Rescued From High Ground',
            explanation:
              'Staying on dry elevated shelter avoids flood currents and lightning conductors while making you clearly visible to responders.',
            outcomePose: 'wave_signal',
            failureHazard: 'none',
          },
          {
            id: 'fl-3-c',
            shortLabel: 'Hold metal antenna mast',
            hoverDescription: 'Lean against the tall steel pole at the roof edge for a clearer look below.',
            actionIcon: 'zap',
            label:
              'Lean against the tall metal roof antenna pole at the terrace edge to get a higher view down the avenue.',
            calmLabel: 'Lean against the tall metal antenna pole at the roof edge.',
            isCorrect: false,
            feedbackTitle: 'Lightning & Edge Fall Risk',
            explanation:
              'Tall metal masts attract storm lightning strikes and leaning at slick roof edges risks dangerous falls.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'lightning_strike',
          },
          {
            id: 'fl-3-d',
            shortLabel: 'Paddle out on float',
            hoverDescription: 'Drop an inflatable float into the street current and paddle toward the boat.',
            actionIcon: 'waves',
            label:
              'Toss an inflatable pool float over the balcony and paddle out toward the rescue boat yourself.',
            calmLabel: 'Drop an inflatable pool float into the street water and paddle out.',
            isCorrect: false,
            feedbackTitle: 'Overturned in Debris Current',
            explanation:
              'Consumer floats tear easily on submerged signs or branches and overturn quickly in urban flood currents.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'swept_water',
          },
        ],
      },
    ],
  },

  fire: {
    id: 'fire',
    title: 'Fire',
    subtitle: 'Smoke in Maplewood Apartments',
    description:
      'A nighttime alarm sounds as dark smoke curls beneath your apartment door. Make calm, life-saving decisions from bedroom door to safe assembly.',
    calmDescription:
      'A low-stimulation walkthrough of an apartment fire evacuation. Take time to check doors and stay low.',
    accentColor: '#DC2626',
    completionBonus: 200,
    stages: [
      {
        id: 'fr-stage-1',
        stageNumber: 1,
        locationName: 'Apartment Bedroom Door',
        sceneKey: 'fr_bedroom',
        introDurationMs: 2800,
        calmIntroDurationMs: 2000,
        timerSeconds: 20,
        establishingText:
          'The smoke alarm sounds as a thin ribbon of gray smoke curls under your closed door.',
        calmEstablishingText:
          'A smoke alarm is sounding and gray smoke appears under the closed bedroom door.',
        prompt: 'Smoke is rising toward the ceiling. What is your first move?',
        calmPrompt: 'Smoke is coming under the closed door. What is the safest first step?',
        safetyPrinciple: 'Stay low under rising smoke and test closed doors with the back of your hand before opening.',
        options: [
          {
            id: 'fr-1-a',
            shortLabel: 'Pull door wide open',
            hoverDescription: 'Stand up and swing the bedroom door open right away to inspect the hallway.',
            actionIcon: 'door',
            label:
              'Stand upright and pull the door wide open immediately so you can look straight into the hallway.',
            calmLabel: 'Stand up and swing the door wide open right away.',
            isCorrect: false,
            feedbackTitle: 'Superheated Smoke Blast',
            explanation:
              'Throwing open an untested door can feed oxygen to fire outside and expose your lungs to lethal superheated smoke.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'smoke_blast',
          },
          {
            id: 'fr-1-b',
            shortLabel: 'Hide inside closet',
            hoverDescription: 'Step into the bedroom closet and pull the folding doors shut behind the coats.',
            actionIcon: 'building',
            label:
              'Step inside the bedroom closet and pull the folding door shut behind your winter coats to wait.',
            calmLabel: 'Hide inside the bedroom closet behind coats until help comes.',
            isCorrect: false,
            feedbackTitle: 'Trapped in Smoke Dead End',
            explanation:
              'Hiding in closets traps you as toxic smoke fills tight spaces and delays firefighters trying to locate occupants.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'smoke_inhalation',
          },
          {
            id: 'fr-1-c',
            shortLabel: 'Pack valuables first',
            hoverDescription: 'Spend a couple of minutes gathering your laptop, passport, and backpack from the desk.',
            actionIcon: 'bag',
            label:
              'Spend a few minutes gathering your laptop, passport, and backpack from the desk before checking the door.',
            calmLabel: 'Pack your laptop, passport, and bag before moving toward the exit.',
            isCorrect: false,
            feedbackTitle: 'Critical Escape Time Lost',
            explanation:
              'Indoor fires double in size rapidly; delaying evacuation to collect belongings can trap you behind spreading flames and smoke.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'smoke_inhalation',
          },
          {
            id: 'fr-1-d',
            shortLabel: 'Stay low & test door',
            hoverDescription: 'Crouch under the smoke and touch the upper door and knob with the back of your hand.',
            actionIcon: 'hand',
            label:
              'Stay low beneath the rising smoke layer and touch the upper door and knob gently with the back of your hand before opening.',
            calmLabel: 'Stay low and test the door and handle with the back of your hand.',
            isCorrect: true,
            feedbackTitle: 'Door Tested Safely',
            explanation:
              'Cleaner air stays near the floor, and testing with the back of your hand detects heat without burning your palm.',
            outcomePose: 'test_door',
            failureHazard: 'none',
          },
        ],
      },
      {
        id: 'fr-stage-2',
        stageNumber: 2,
        locationName: 'Smoke-Filled Corridor',
        sceneKey: 'fr_corridor',
        introDurationMs: 2600,
        calmIntroDurationMs: 1900,
        timerSeconds: 20,
        establishingText:
          'You slip into the corridor where thick smoke hangs overhead and an EXIT sign glows ahead.',
        calmEstablishingText:
          'Smoke fills the top half of the corridor. A green EXIT stairwell sign glows ahead.',
        prompt: 'Visibility is dropping in the corridor. How do you reach safety?',
        calmPrompt: 'Thick smoke hangs near the ceiling. How should you move to the stairwell exit?',
        safetyPrinciple: 'Crawl low under smoke, use the marked stairwell—never the elevator—and close doors behind you.',
        options: [
          {
            id: 'fr-2-a',
            shortLabel: 'Crawl low to EXIT stairs',
            hoverDescription: 'Stay beneath the smoke layer along the wall to the stairwell door and close it behind you.',
            actionIcon: 'stairs',
            label:
              'Drop to a crawl below the smoke line, follow the wall toward the illuminated EXIT stairwell door, and close doors behind you.',
            calmLabel: 'Crawl low under the smoke to the EXIT stairs and shut doors behind you.',
            isCorrect: true,
            feedbackTitle: 'Clear Air Below the Smoke',
            explanation:
              'Crawling keeps you in cooler, breathable air near the floor, wall-following prevents disorientation, and closed doors slow fire spread.',
            outcomePose: 'crawl_low',
            failureHazard: 'none',
          },
          {
            id: 'fr-2-b',
            shortLabel: 'Take hallway elevator',
            hoverDescription: 'Sprint upright down the middle of the hall and press the elevator call button.',
            actionIcon: 'elevator',
            label:
              'Sprint upright down the middle of the corridor to press the elevator button and ride straight to the lobby.',
            calmLabel: 'Run upright to the elevator and press the lobby button.',
            isCorrect: false,
            feedbackTitle: 'Smoke Inhalation & Elevator Failure',
            explanation:
              'Running upright forces you to breathe thick toxic fumes, and elevators can stall in outages or open onto the fire floor.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'smoke_inhalation',
          },
          {
            id: 'fr-2-c',
            shortLabel: 'Climb outer drain pipe',
            hoverDescription: 'Break open the third-floor corridor window and climb down the exterior pipe.',
            actionIcon: 'window',
            label:
              'Shatter the third-floor corridor window and climb down the narrow exterior drainage pipe.',
            calmLabel: 'Open the third-floor hallway window and climb down the outer pipe.',
            isCorrect: false,
            feedbackTitle: 'Exterior Pipe Collapse',
            explanation:
              'Drainage pipes cannot support human weight, and breaking windows draws fresh oxygen into the building, accelerating the fire.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'balcony_fall',
          },
          {
            id: 'fr-2-d',
            shortLabel: 'Fetch kitchen water',
            hoverDescription: 'Head back inside your apartment to fill a pitcher of water to throw at the smoke.',
            actionIcon: 'waves',
            label:
              'Run back into your apartment kitchen to fill a drinking pitcher with water to throw at the hallway smoke.',
            calmLabel: 'Go back to your kitchen for a pitcher of water to fight the smoke.',
            isCorrect: false,
            feedbackTitle: 'Cut Off by Spreading Fire',
            explanation:
              'Turning back wastes irreplaceable escape seconds; small household containers cannot extinguish a structural hallway fire.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'smoke_inhalation',
          },
        ],
      },
      {
        id: 'fr-stage-3',
        stageNumber: 3,
        locationName: 'Exterior Assembly Point',
        sceneKey: 'fr_courtyard',
        introDurationMs: 2600,
        calmIntroDurationMs: 1900,
        timerSeconds: 20,
        establishingText:
          'Outside in the night courtyard, an ember catches your sleeve as a neighbor shouts about inside.',
        calmEstablishingText:
          'You are outside the building. A small spark catches your sleeve and a neighbor urges going back in.',
        prompt: 'A spark ignites your sleeve while a neighbor begs you to re-enter. Act now.',
        calmPrompt: 'You are outside now. A spark is on your sleeve and someone wants to go back in.',
        safetyPrinciple: 'Stop, Drop, and Roll if clothing catches fire; stay outside at the assembly point and alert firefighters.',
        options: [
          {
            id: 'fr-3-a',
            shortLabel: 'Re-enter smoky lobby',
            hoverDescription: 'Rush back through the main apartment doors to search the second-floor hallway.',
            actionIcon: 'flame',
            label:
              'Rush back inside through the smoky main lobby doors to search the second-floor hallway yourself.',
            calmLabel: 'Run back inside the smoky building to search the hallway.',
            isCorrect: false,
            feedbackTitle: 'Trapped Re-Entering Burning Building',
            explanation:
              'Re-entering a burning structure is extremely dangerous; trained firefighters with breathing apparatus handle interior search.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'smoke_inhalation',
          },
          {
            id: 'fr-3-b',
            shortLabel: 'Run to blow out spark',
            hoverDescription: 'Sprint quickly across the courtyard so the night air blows the spark off your jacket.',
            actionIcon: 'wind',
            label:
              'Sprint rapidly across the courtyard in circles so the night wind blows the spark off your sleeve.',
            calmLabel: 'Run quickly in circles so the wind blows out the spark.',
            isCorrect: false,
            feedbackTitle: 'Wind Fans Clothing Flames',
            explanation:
              'Running feeds oxygen to burning fabric and intensifies flames; always Stop, Drop, and Roll to smother clothing fire.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'flame_flare',
          },
          {
            id: 'fr-3-c',
            shortLabel: 'Wait under balcony',
            hoverDescription: 'Stand beneath the second-floor apartment balcony so arriving crews notice you near the door.',
            actionIcon: 'alert',
            label:
              'Stand directly beneath the burning second-floor balcony so firefighters can see you next to the doorway.',
            calmLabel: 'Stand right under the burning second-floor balcony.',
            isCorrect: false,
            feedbackTitle: 'Falling Glass & Embers Zone',
            explanation:
              'Standing close to a burning facade exposes you to falling shattered glass, burning debris, and active hose streams.',
            outcomePose: 'fall_knockdown',
            failureHazard: 'falling_debris',
          },
          {
            id: 'fr-3-d',
            shortLabel: 'Stop, drop, roll & assemble',
            hoverDescription: 'Smother the sleeve spark on the ground, move to the assembly sign, and brief firefighters.',
            actionIcon: 'shield',
            label:
              'Stop, drop, and roll to smother the sleeve spark, then wait well back at the clear assembly sign and tell firefighters who may still be inside.',
            calmLabel: 'Stop, drop, and roll out the spark, wait at the assembly sign, and inform firefighters.',
            isCorrect: true,
            feedbackTitle: 'Safe at Assembly Point',
            explanation:
              'Smothering sparks by rolling avoids fanning flames, and staying at the assembly point lets emergency crews act safely.',
            outcomePose: 'roll_extinguish',
            failureHazard: 'none',
          },
        ],
      },
    ],
  },
};

export const DISASTER_LIST: DisasterScenario[] = [
  DISASTER_SCENARIOS.earthquake,
  DISASTER_SCENARIOS.flood,
  DISASTER_SCENARIOS.fire,
];
