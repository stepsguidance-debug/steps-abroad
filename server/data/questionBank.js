function c(label, value, analytical, creative, applied, social, aiReadiness) {
  return {
    label,
    value,
    weights: { analytical, creative, applied, social, aiReadiness },
  };
}

const sectionTitles = {
  A: "Academic & Cognitive Signals",
  B: "Behaviour & Work Style",
  C: "Exposure & Awareness",
  D: "Risk, Ambition & Constraints",
  E: "AI Awareness & Adaptability",
  F: "Motivation & Internal Drivers",
  G: "Constraints & Reality",
};

const QUESTIONS = [
  {
    section: "A", layer: "L1", type: "mcq",
    questionText: "Which subjects did you consistently score highest in with least effort?",
    choices: [
      c("Sciences", "sciences", 9, 4, 6, 3, 6),
      c("Commerce", "commerce", 7, 4, 5, 5, 6),
      c("Arts", "arts", 3, 9, 4, 6, 5),
      c("Languages", "languages", 4, 7, 3, 8, 5),
    ],
  },
  {
    section: "A", layer: "L1", type: "mcq",
    questionText: "Which subjects required maximum effort but still gave average results?",
    choices: [
      c("Sciences", "sciences", 2, 5, 3, 4, 4),
      c("Commerce", "commerce", 4, 4, 4, 4, 4),
      c("Arts", "arts", 6, 2, 5, 4, 4),
      c("Languages", "languages", 5, 3, 4, 2, 4),
    ],
  },
  {
    section: "A", layer: "L1", type: "mcq",
    questionText: "When solving a difficult problem, your natural approach is?",
    choices: [
      c("Step-by-step breakdown", "step_by_step", 10, 3, 6, 3, 6),
      c("Trial and error", "trial_and_error", 5, 5, 8, 2, 5),
      c("Intuitive guess", "intuitive_guess", 3, 8, 4, 3, 4),
      c("Ask for help", "ask_for_help", 2, 3, 3, 8, 5),
    ],
  },
  {
    section: "A", layer: "L1", type: "mcq",
    questionText: "Do you enjoy working with?",
    choices: [
      c("Numbers and data", "numbers_and_data", 10, 3, 5, 2, 7),
      c("Words and communication", "words_and_communication", 4, 8, 3, 9, 6),
      c("Physical systems or machines", "physical_systems_or_machines", 7, 4, 10, 2, 6),
      c("People and behaviour", "people_and_behaviour", 3, 6, 4, 10, 5),
    ],
  },
  {
    section: "A", layer: "L1", type: "mcq",
    questionText: "Have you ever lost track of time while doing what?",
    choices: [
      c("Solving a problem", "solving_a_problem", 9, 4, 6, 2, 6),
      c("Creating something", "creating_something", 4, 10, 5, 3, 6),
      c("Watching or learning a topic", "watching_or_learning", 7, 6, 4, 3, 7),
      c("None of these", "none_of_these", 2, 2, 2, 2, 2),
    ],
  },
  {
    section: "A", layer: "L1", type: "mcq",
    questionText: "In exams, you usually?",
    choices: [
      c("Finish early", "finish_early", 8, 4, 5, 3, 5),
      c("Run out of time", "run_out_of_time", 4, 5, 4, 3, 3),
      c("Skip difficult questions", "skip_difficult_questions", 3, 3, 2, 2, 2),
      c("Rush at the end", "rush_at_the_end", 5, 4, 4, 2, 3),
    ],
  },
  {
    section: "A", layer: "L1", type: "mcq",
    questionText: "When given a new type of problem, you?",
    choices: [
      c("Look for patterns", "look_for_patterns", 10, 5, 5, 2, 6),
      c("Apply known formulas", "apply_known_formulas", 8, 2, 5, 2, 5),
      c("Try multiple approaches", "try_multiple_approaches", 7, 7, 8, 3, 7),
      c("Wait for guidance", "wait_for_guidance", 2, 2, 2, 5, 3),
    ],
  },

  {
    section: "B", layer: "L2", type: "forced-choice",
    questionText: "Do you prefer?",
    choices: [
      c("Clear instructions", "clear_instructions", 6, 3, 5, 3, 4),
      c("Open-ended problems", "open_ended_problems", 7, 9, 6, 4, 7),
    ],
  },
  {
    section: "B", layer: "L2", type: "mcq",
    questionText: "How do you react when something is unclear?",
    choices: [
      c("Try to figure it out", "try_to_figure_it_out", 8, 6, 7, 4, 7),
      c("Wait for guidance", "wait_for_guidance", 3, 2, 2, 4, 3),
      c("Avoid it", "avoid_it", 1, 1, 1, 1, 1),
      c("Ask someone immediately", "ask_someone_immediately", 3, 2, 2, 8, 4),
    ],
  },
  {
    section: "B", layer: "L2", type: "mcq",
    questionText: "Do you enjoy working?",
    choices: [
      c("Alone", "alone", 7, 6, 6, 2, 5),
      c("In small teams", "in_small_teams", 6, 6, 6, 8, 6),
      c("In large groups", "in_large_groups", 4, 5, 4, 9, 5),
      c("Depends on task", "depends_on_task", 7, 7, 7, 7, 7),
    ],
  },
  {
    section: "B", layer: "L2", type: "forced-choice",
    questionText: "Which describes you better?",
    choices: [
      c("Consistent and disciplined", "consistent_and_disciplined", 7, 4, 7, 5, 6),
      c("Burst of energy then drop", "burst_of_energy_then_drop", 4, 7, 4, 4, 3),
    ],
  },
  {
    section: "B", layer: "L2", type: "forced-choice",
    questionText: "Do you complete tasks even when they become boring?",
    choices: [
      c("Yes always", "yes_always", 7, 4, 7, 5, 6),
      c("Sometimes", "sometimes", 5, 5, 5, 5, 5),
      c("Rarely", "rarely", 2, 4, 2, 3, 2),
    ],
  },
  {
    section: "B", layer: "L2", type: "mcq",
    questionText: "When stuck for 20 minutes on a problem you?",
    choices: [
      c("Persist and try again", "persist_and_try_again", 8, 5, 8, 3, 7),
      c("Switch to something else", "switch_to_something_else", 5, 5, 4, 3, 5),
      c("Quit and return later", "quit_and_return_later", 3, 3, 3, 2, 3),
      c("Ask for help", "ask_for_help", 3, 2, 3, 8, 4),
    ],
  },
  {
    section: "B", layer: "L2", type: "forced-choice",
    questionText: "When a deadline is near you?",
    choices: [
      c("Work consistently throughout", "work_consistently_throughout", 7, 4, 7, 5, 6),
      c("Rush at the last minute", "rush_at_the_last_minute", 4, 6, 4, 4, 3),
    ],
  },

  {
    section: "C", layer: "L3", type: "mcq",
    questionText: "How many careers are you currently seriously considering?",
    choices: [
      c("1", "1", 5, 4, 4, 3, 4),
      c("2–3", "2_3", 6, 6, 5, 4, 6),
      c("More than 3", "more_than_3", 5, 7, 4, 4, 5),
      c("None decided", "none_decided", 2, 3, 2, 2, 2),
    ],
  },
  {
    section: "C", layer: "L3", type: "mcq",
    questionText: "Why are you considering your top career choice?",
    choices: [
      c("Genuine interest", "genuine_interest", 7, 7, 6, 5, 7),
      c("Good salary", "good_salary", 5, 3, 5, 3, 5),
      c("Parents suggested", "parents_suggested", 3, 2, 3, 4, 2),
      c("Peer influence", "peer_influence", 2, 3, 2, 5, 2),
    ],
  },
  {
    section: "C", layer: "L3", type: "forced-choice",
    questionText: "Do you personally know someone working in your preferred field?",
    choices: [
      c("Yes", "yes", 5, 5, 5, 6, 5),
      c("No", "no", 4, 4, 4, 3, 4),
    ],
  },
  {
    section: "C", layer: "L3", type: "mcq",
    questionText: "Have you done any of the following?",
    choices: [
      c("Internship", "internship", 6, 4, 8, 6, 7),
      c("Project", "project", 7, 6, 8, 4, 7),
      c("Online course", "online_course", 6, 5, 5, 3, 8),
      c("None", "none", 2, 2, 2, 2, 2),
    ],
  },
  {
    section: "C", layer: "L3", type: "mcq",
    questionText: "How much of your career decision is influenced by parents?",
    choices: [
      c("Fully", "fully", 2, 2, 2, 3, 2),
      c("Mostly", "mostly", 3, 3, 3, 4, 3),
      c("Slightly", "slightly", 5, 5, 5, 4, 5),
      c("Not at all", "not_at_all", 6, 6, 5, 3, 6),
    ],
  },
  {
    section: "C", layer: "L3", type: "forced-choice",
    questionText: "Have you researched the day-to-day work of your preferred career?",
    choices: [
      c("Yes in detail", "yes_in_detail", 7, 6, 6, 4, 7),
      c("Briefly", "briefly", 5, 5, 5, 4, 5),
      c("Not yet", "not_yet", 2, 2, 2, 2, 2),
    ],
  },
  {
    section: "C", layer: "L3", type: "mcq",
    questionText: "What is the main source of your career knowledge?",
    choices: [
      c("Internet", "internet", 6, 5, 5, 3, 7),
      c("Family", "family", 3, 3, 3, 5, 3),
      c("School", "school", 4, 4, 4, 4, 4),
      c("Self-research", "self_research", 8, 6, 6, 3, 8),
    ],
  },

  {
    section: "D", layer: "L2", type: "forced-choice",
    questionText: "Would you choose?",
    choices: [
      c("Stable 6–8L job", "stable_job", 5, 3, 4, 4, 4),
      c("High-risk path with 20L+ potential", "high_risk_path", 6, 6, 5, 4, 6),
    ],
  },
  {
    section: "D", layer: "L2", type: "mcq",
    questionText: "Are you open to moving abroad for education or work?",
    choices: [
      c("Yes eagerly", "yes_eagerly", 6, 6, 5, 5, 8),
      c("Yes if needed", "yes_if_needed", 6, 5, 5, 5, 7),
      c("Prefer to stay", "prefer_to_stay", 4, 4, 4, 4, 3),
      c("Not at all", "not_at_all", 3, 3, 3, 3, 2),
    ],
  },
  {
    section: "D", layer: "L2", type: "forced-choice",
    questionText: "Are you open to taking an education loan?",
    choices: [
      c("Yes", "yes", 5, 5, 4, 4, 6),
      c("No", "no", 4, 4, 4, 4, 3),
    ],
  },
  {
    section: "D", layer: "L2", type: "mcq",
    questionText: "What is your family's primary expectation from your career?",
    choices: [
      c("Stability", "stability", 5, 3, 4, 4, 4),
      c("Prestige", "prestige", 4, 4, 4, 5, 4),
      c("High income", "high_income", 5, 4, 5, 4, 5),
      c("Freedom of choice", "freedom_of_choice", 6, 6, 5, 4, 7),
    ],
  },
  {
    section: "D", layer: "L2", type: "mcq",
    questionText: "How important is work-life balance to you?",
    choices: [
      c("Most important", "most_important", 5, 5, 4, 6, 5),
      c("Important", "important", 6, 5, 5, 5, 6),
      c("Somewhat", "somewhat", 5, 4, 5, 4, 5),
      c("Not a priority", "not_a_priority", 5, 5, 6, 3, 5),
    ],
  },
  {
    section: "D", layer: "L2", type: "mcq",
    questionText: "How important is social impact in your work?",
    choices: [
      c("Very important", "very_important", 4, 6, 4, 9, 6),
      c("Somewhat important", "somewhat_important", 5, 5, 5, 6, 5),
      c("Not important", "not_important", 5, 3, 5, 2, 4),
      c("Undecided", "undecided", 4, 4, 4, 4, 4),
    ],
  },
  {
    section: "D", layer: "L2", type: "mcq",
    questionText: "What is your budget range for higher education?",
    choices: [
      c("Under 5L", "under_5l", 4, 4, 4, 4, 3),
      c("5–15L", "5_15l", 5, 5, 5, 4, 4),
      c("15–30L", "15_30l", 5, 5, 5, 4, 5),
      c("Above 30L", "above_30l", 5, 5, 5, 4, 6),
    ],
  },

  {
    section: "E", layer: "L5", type: "mcq",
    questionText: "What do you think AI will replace in the next 10 years?",
    choices: [
      c("Repetitive jobs", "repetitive_jobs", 6, 4, 5, 4, 9),
      c("Creative jobs", "creative_jobs", 4, 6, 3, 4, 5),
      c("All jobs", "all_jobs", 3, 3, 2, 3, 2),
      c("Very few jobs", "very_few_jobs", 3, 3, 3, 3, 2),
    ],
  },
  {
    section: "E", layer: "L5", type: "mcq",
    questionText: "Have you used tools like ChatGPT, Excel automation, or similar AI tools?",
    choices: [
      c("Regularly", "regularly", 6, 6, 6, 4, 10),
      c("Occasionally", "occasionally", 5, 5, 5, 4, 7),
      c("Once or twice", "once_or_twice", 4, 4, 4, 3, 4),
      c("Never", "never", 2, 2, 2, 2, 1),
    ],
  },
  {
    section: "E", layer: "L5", type: "forced-choice",
    questionText: "Are you comfortable learning new digital tools frequently?",
    choices: [
      c("Yes", "yes", 6, 6, 6, 4, 9),
      c("No", "no", 2, 2, 2, 2, 1),
    ],
  },
  {
    section: "E", layer: "L5", type: "forced-choice",
    questionText: "Would you prefer?",
    choices: [
      c("A stable skill you master once", "stable_skill", 5, 3, 4, 3, 3),
      c("Continuous learning and adapting", "continuous_learning", 7, 6, 6, 4, 9),
    ],
  },
  {
    section: "E", layer: "L5", type: "mcq",
    questionText: "When a tool replaces a skill you have, you?",
    choices: [
      c("Try to learn the new tool", "learn_the_new_tool", 7, 6, 6, 4, 10),
      c("Feel threatened", "feel_threatened", 3, 2, 2, 2, 1),
      c("Wait and watch", "wait_and_watch", 4, 3, 3, 3, 4),
      c("Ignore it", "ignore_it", 2, 2, 2, 2, 1),
    ],
  },
  {
    section: "E", layer: "L5", type: "mcq",
    questionText: "Have you used AI to solve problems, create content, or automate tasks?",
    choices: [
      c("Yes all three", "yes_all_three", 7, 7, 7, 4, 10),
      c("Yes some", "yes_some", 6, 6, 6, 4, 8),
      c("Tried once", "tried_once", 4, 4, 4, 3, 4),
      c("Never", "never", 2, 2, 2, 2, 1),
    ],
  },
  {
    section: "E", layer: "L5", type: "mcq",
    questionText: "How do you feel about working alongside AI tools in your future job?",
    choices: [
      c("Excited", "excited", 6, 6, 6, 4, 10),
      c("Neutral", "neutral", 5, 5, 5, 4, 5),
      c("Worried", "worried", 3, 3, 3, 3, 2),
      c("Strongly against", "strongly_against", 2, 2, 2, 2, 1),
    ],
  },

  {
    section: "F", layer: "L3", type: "mcq",
    questionText: "What kind of work gives you the most satisfaction?",
    choices: [
      c("Solving hard problems", "solving_hard_problems", 9, 4, 6, 3, 6),
      c("Helping others", "helping_others", 4, 5, 4, 10, 5),
      c("Creating new things", "creating_new_things", 5, 10, 5, 4, 6),
      c("Leading teams", "leading_teams", 5, 5, 5, 9, 6),
    ],
  },
  {
    section: "F", layer: "L3", type: "mcq",
    questionText: "Do you prefer?",
    choices: [
      c("Recognition", "recognition", 4, 5, 4, 7, 4),
      c("Money", "money", 5, 3, 5, 3, 4),
      c("Freedom", "freedom", 6, 7, 5, 4, 6),
      c("Meaning", "meaning", 4, 6, 4, 8, 6),
    ],
  },
  {
    section: "F", layer: "L3", type: "mcq",
    questionText: "What frustrates you most in studies or work?",
    choices: [
      c("Repetition", "repetition", 5, 7, 4, 3, 6),
      c("Unclear goals", "unclear_goals", 7, 4, 5, 4, 5),
      c("Lack of feedback", "lack_of_feedback", 4, 4, 4, 7, 5),
      c("Working alone", "working_alone", 3, 4, 3, 9, 4),
    ],
  },
  {
    section: "F", layer: "L3", type: "mcq",
    questionText: "If failure had no consequences, what would you try?",
    choices: [
      c("Start a business", "start_a_business", 6, 7, 7, 6, 7),
      c("Research a big problem", "research_a_big_problem", 10, 5, 5, 3, 7),
      c("Create art or content", "create_art_or_content", 4, 10, 4, 5, 6),
      c("Travel and explore", "travel_and_explore", 4, 6, 4, 6, 6),
    ],
  },
  {
    section: "F", layer: "L3", type: "mcq",
    questionText: "What motivates you to push through difficult tasks?",
    choices: [
      c("Personal pride", "personal_pride", 7, 5, 6, 4, 6),
      c("Financial reward", "financial_reward", 5, 3, 5, 3, 4),
      c("Fear of failure", "fear_of_failure", 4, 3, 4, 3, 2),
      c("Curiosity", "curiosity", 7, 8, 6, 3, 7),
    ],
  },
  {
    section: "F", layer: "L3", type: "mcq",
    questionText: "How do you feel after completing a challenging project?",
    choices: [
      c("Proud and energised", "proud_and_energised", 7, 6, 7, 5, 7),
      c("Relieved it is over", "relieved_it_is_over", 4, 4, 4, 3, 4),
      c("Indifferent", "indifferent", 2, 2, 2, 2, 2),
      c("Depends on the project", "depends_on_the_project", 5, 5, 5, 5, 5),
    ],
  },
  {
    section: "F", layer: "L3", type: "mcq",
    questionText: "What would your ideal workday look like?",
    choices: [
      c("Solving problems independently", "solving_problems_independently", 8, 5, 6, 2, 6),
      c("Collaborating with a team", "collaborating_with_a_team", 5, 5, 5, 9, 6),
      c("Teaching or guiding others", "teaching_or_guiding_others", 4, 6, 4, 10, 6),
      c("Mixing all of these", "mixing_all_of_these", 7, 7, 7, 7, 7),
    ],
  },

  {
    section: "G", layer: "L3", type: "mcq",
    questionText: "What is your current academic score range?",
    choices: [
      c("Above 85%", "above_85", 8, 5, 6, 4, 6),
      c("70–85%", "70_85", 6, 5, 5, 4, 5),
      c("55–70%", "55_70", 4, 4, 4, 4, 4),
      c("Below 55%", "below_55", 2, 3, 2, 3, 2),
    ],
  },
  {
    section: "G", layer: "L3", type: "mcq",
    questionText: "What is your preferred country for higher education?",
    choices: [
      c("India", "india", 4, 4, 4, 4, 4),
      c("UK or Europe", "uk_or_europe", 6, 6, 5, 5, 7),
      c("USA or Canada", "usa_or_canada", 6, 6, 5, 5, 8),
      c("Australia or others", "australia_or_others", 5, 5, 5, 5, 7),
    ],
  },
  {
    section: "G", layer: "L3", type: "mcq",
    questionText: "How urgent is your decision?",
    choices: [
      c("Immediate, within months", "immediate", 5, 4, 5, 4, 5),
      c("1–2 years", "1_2_years", 6, 5, 5, 4, 6),
      c("More than 2 years", "more_than_2_years", 5, 5, 5, 4, 5),
      c("Not decided", "not_decided", 2, 3, 2, 2, 2),
    ],
  },
  {
    section: "G", layer: "L3", type: "mcq",
    questionText: "What is your family's financial support level for education?",
    choices: [
      c("Full support", "full_support", 5, 5, 5, 4, 5),
      c("Partial support", "partial_support", 5, 5, 5, 4, 5),
      c("Need scholarship", "need_scholarship", 6, 5, 5, 4, 6),
      c("Self-funding", "self_funding", 7, 5, 6, 4, 7),
    ],
  },
  {
    section: "G", layer: "L3", type: "forced-choice",
    questionText: "Do you have any specific health or personal constraints affecting career choice?",
    choices: [
      c("Yes", "yes", 4, 4, 4, 4, 4),
      c("No", "no", 5, 5, 5, 4, 5),
    ],
  },
  {
    section: "G", layer: "L3", type: "forced-choice",
    questionText: "Are you the first in your family to pursue higher education?",
    choices: [
      c("Yes", "yes", 5, 5, 5, 5, 6),
      c("No", "no", 5, 5, 5, 4, 5),
    ],
  },
  {
    section: "G", layer: "L3", type: "mcq",
    questionText: "What is your preferred study mode?",
    choices: [
      c("Full-time on campus", "full_time_on_campus", 6, 5, 5, 6, 6),
      c("Part-time", "part_time", 5, 4, 5, 4, 5),
      c("Online", "online", 6, 5, 5, 3, 8),
      c("Hybrid", "hybrid", 6, 6, 5, 5, 8),
    ],
  },
  {
    section: "G", layer: "L3", type: "forced-choice",
    questionText: "Do you have a backup education or career plan if your first choice does not work out?",
    choices: [
      c("Yes", "yes", 7, 5, 5, 4, 7),
      c("No", "no", 3, 3, 3, 3, 2),
    ],
  },
];

function getSeedQuestions() {
  return QUESTIONS.map((question, index) => ({
    ...question,
    sectionTitle: sectionTitles[question.section],
    order: index + 1,
  }));
}

module.exports = {
  getSeedQuestions,
  sectionTitles,
};
