import { KnowledgeArticle } from '../types';

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'guide-regenerative-soil-carbon',
    title: 'Mastering Soil Organic Carbon (SOC) Enhancement in Smallholder Holdings',
    category: 'Soil Management',
    readTimeMinutes: 6,
    languagesAvailable: ['en', 'hi', 'pt', 'zh', 'ar', 'sw'],
    summary: 'Step-by-step roadmap to raise soil organic carbon from <0.6% to >1.2% using biochar, legume green manure, and zero-till straw retention.',
    contentMarkdown: `
### Why Soil Organic Carbon is the Key to Climate Resilience
Soil Organic Carbon (SOC) acts as the biological sponge of your soil. Every 1% increase in SOC allows an acre of soil to hold an additional **75,000 litres of water**, buffering crops against drought spells.

#### Recommended 3-Step Protocol:
1. **Never Burn Crop Residue**: Burning stubble destroys beneficial mycorrhizal fungi and volatilizes precious nitrogen into greenhouse gases. Use a mulcher or direct-drilling *Happy Seeder*.
2. **Incorporate 2.5 tons/ha of Pyrolyzed Biochar**: Biochar provides porous microscopic housing for nitrogen-fixing bacteria and persists in soil for over a century.
3. **Sow Sunn Hemp (Dhaincha/Crotalaria) as Green Manure**: Grow for 45 days prior to main crop sowing, then incorporate into the top 15cm of soil.
    `,
    practicalActionChecklist: [
      'Stop all surface crop residue burning immediately',
      'Apply 25 kg/ha Zinc Sulfate with basal compost',
      'Test soil organic carbon every 12 months using local KVK labs',
      'Maintain continuous living root cover with cover crop relays',
    ],
  },
  {
    id: 'guide-integrated-pest-management',
    title: 'Foliar Pathogen Defense: Biological Control & Threshold Spraying',
    category: 'Pest Control',
    readTimeMinutes: 5,
    languagesAvailable: ['en', 'hi', 'pt', 'es', 'zh'],
    summary: 'How to combine Trichoderma bio-fungicides, neem seed extracts, and calibrated spray timing to halt disease without chemical overuse.',
    contentMarkdown: `
### Moving Beyond Calendar-Based Chemical Spraying
Routine prophylactic chemical spraying breeds pathogen resistance and kills beneficial predators (ladybird beetles, spiders, parasitoid wasps).

#### Key Principles of Sovereign IPM:
- **Daily Foliar Scouting**: Look beneath the lower leaves for early pustules or chlorotic yellowing before symptoms reach the upper canopy.
- **Biocontrol First Line of Defense**: At the first sign of leaf spot or rust, apply *Trichoderma viride* or *Bacillus subtilis* at 5g/L water during early morning.
- **Save Systemic Triazoles for Severe Incursions**: Only resort to chemical fungicides (e.g., Propiconazole) if the disease exceeds the 10% leaf area threshold.
    `,
    practicalActionChecklist: [
      'Scout 20 random plants across the field diagonally twice per week',
      'Spray bio-fungicides early morning (6-9 AM) to avoid UV degradation',
      'Use hollow-cone nozzles for complete under-leaf coverage',
      'Upload ambiguous leaf photos to BRICS AgriNet Vision for instant diagnosis',
    ],
  },
  {
    id: 'guide-climate-smart-water',
    title: 'Solar Micro-Drip Fertigation & Rainwater Harvesting Strategies',
    category: 'Climate Resilience',
    readTimeMinutes: 7,
    languagesAvailable: ['en', 'hi', 'mr', 'te', 'pt', 'am'],
    summary: 'Techniques to cut irrigation water consumption by 45% while delivering liquid bio-fertilizers directly to root zones via gravity and solar drip systems.',
    contentMarkdown: `
### Maximum Crop per Drop in Changing Monsoons
With erratic rainfall and declining groundwater tables across BRICS agricultural belts, micro-irrigation transforms farming economics.

#### Practical Implementation:
- **Solar Drip Integration**: Low-pressure solar DC pumps eliminate diesel fuel costs and provide steady drip irrigation during peak sunlight hours.
- **Mulch Capillary Protection**: Covering drip lines with straw mulch reduces soil evaporation by up to 60%.
- **Liquid Bio-Fertigation**: Inject liquid Azotobacter and PSB consortia directly through the venturi injector once every 14 days.
    `,
    practicalActionChecklist: [
      'Inspect drip emitters weekly for salt or algae clogging',
      'Schedule irrigation during early morning or late evening',
      'Install tensiometers or soil moisture probes at 15cm and 30cm depths',
      'Enroll in regional micro-irrigation government subsidy schemes',
    ],
  },
];
