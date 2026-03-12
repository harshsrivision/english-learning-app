INSERT INTO lessons (title, level, duration_minutes, focus, hindi_summary) VALUES
  ('Daily Introduction', 'beginner', 15, 'Simple self-introduction and greeting flow', 'Apna parichay dena, naam batana, aur basic greeting ko natural tarike se bolna.'),
  ('Workplace English', 'intermediate', 20, 'Meetings, updates, and asking for clarification', 'Office meetings mein update dena aur doubt clear karne ke liye useful English.'),
  ('Client Presentation', 'advanced', 30, 'Structured pitch, confidence, and business vocabulary', 'Professional presentation ke liye structured speaking aur impact language.'),
  ('Leadership Communication', 'professional', 35, 'Negotiation, persuasion, and executive tone', 'Senior-level communication ke liye persuasive aur polished English speaking.');

INSERT INTO grammar_topics (english_title, hindi_title, explanation, example, level) VALUES
  ('Simple Present', 'Simple Present Tense', 'Jab hum habit, routine ya universal truth ke baare mein bolte hain tab simple present use hota hai.', 'I go to the office every day. / Main roz office jata hoon.', 'beginner'),
  ('Present Continuous', 'Present Continuous Tense', 'Jo kaam abhi chal raha hai uske liye is tense ka use hota hai. Helping verb plus verb-ing lagta hai.', 'She is speaking with the teacher. / Woh teacher se baat kar rahi hai.', 'beginner'),
  ('Modal Verbs', 'Can, Could, Should ka use', 'Permission, ability, suggestion aur polite request batane ke liye modal verbs ka use hota hai.', 'Could you repeat that please? / Kya aap ise dobara bol sakte hain?', 'intermediate'),
  ('Professional Connectors', 'Formal linking phrases', 'Presentation aur meetings mein ideas ko connect karne ke liye however, therefore, in addition jaise phrases use hote hain.', 'Therefore, we recommend a phased rollout. / Isliye hum phase-wise rollout suggest karte hain.', 'professional');

INSERT INTO vocabulary_terms (english, hindi, category, usage_sentence, level) VALUES
  ('Schedule', 'Samay-sarani / plan', 'Work', 'I will share the project schedule by evening.', 'intermediate'),
  ('Confident', 'Atmavishvas se bhara hua', 'Personality', 'You sound more confident when you speak slowly.', 'beginner'),
  ('Negotiate', 'Baat-cheet karke samjhauta karna', 'Business', 'We need to negotiate the final price with the client.', 'advanced'),
  ('Outcome', 'Parinam', 'Meetings', 'Let us focus on the expected outcome of this call.', 'professional'),
  ('Clarify', 'Spasht karna', 'Communication', 'Could you clarify the second point once more?', 'intermediate'),
  ('Deadline', 'Antim tareekh', 'Work', 'We must finish this report before the deadline.', 'beginner'),
  ('Collaborate', 'Milkar kaam karna', 'Business', 'Our teams will collaborate on the next release.', 'advanced'),
  ('Polite', 'Vinarm', 'Conversation', 'A polite tone makes your request sound professional.', 'beginner'),
  ('Feedback', 'Pratikriya / sujhav', 'Meetings', 'Thank you for the feedback on my presentation.', 'intermediate'),
  ('Opportunity', 'Avasar', 'Career', 'This role is a good opportunity to improve my communication skills.', 'advanced');

INSERT INTO conversation_scenarios (title, context, difficulty, target_outcome) VALUES
  ('Restaurant Visit', 'Practice ordering food, asking about the menu, and paying politely.', 'beginner', 'Speak clearly in a basic public interaction.'),
  ('Job Interview', 'Answer common interview questions with Hindi hints and follow-up prompts.', 'advanced', 'Explain experience and strengths with confidence.'),
  ('Client Escalation Call', 'Handle an upset customer, show empathy, and propose next steps.', 'professional', 'Maintain calm, clarity, and authority in spoken English.');
