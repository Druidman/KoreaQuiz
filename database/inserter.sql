do $$
declare
  item jsonb;
  qid  uuid;
  oid  uuid;
  opt  text;
  ord  bigint;
begin
  for item in
    select * from jsonb_array_elements($json$
[
  {
    "question": "Jaka jest stolica Korei Południowej?",
    "options": ["Seul", "Pusan", "Pjongjang", "Tokio"],
    "duration": 20
  },
  {
    "question": "Jak nazywa się waluta Korei Południowej?",
    "options": ["won", "jen", "juan", "rupia"],
    "duration": 20
  },
  {
    "question": "Jak nazywa się słynna koreańska kiszona kapusta z ostrą papryką?",
    "options": ["kimchi", "sushi", "ramen", "tofu"],
    "duration": 20
  },
  {
    "question": "Jak nazywa się koreański alfabet?",
    "options": ["hangul", "kanji", "hiragana", "cyrylica"],
    "duration": 30
  },
  {
    "question": "Z jakim krajem Korea Południowa ma granicę lądową?",
    "options": ["z Koreą Północną", "z Chinami", "z Japonią", "z Rosją"],
    "duration": 20
  },
  {
    "question": "W którym roku w Seulu odbyły się letnie igrzyska olimpijskie?",
    "options": ["1988", "1976", "1980", "2000"],
    "duration": 30
  },
  {
    "question": "Jakie jest drugie największe miasto Korei Południowej, duży port nad morzem?",
    "options": ["Pusan (Busan)", "Osaka", "Szanghaj", "Hanoi"],
    "duration": 30
  },
  {
    "question": "Ilu mniej więcej mieszkańców ma Korea Południowa?",
    "options": ["51 mln", "5 mln", "20 mln", "150 mln"],
    "duration": 30
  },
  {
    "question": "Który popularny serial Netflixa pochodzi z Korei Południowej?",
    "options": ["Squid Game", "Stranger Things", "Wednesday", "Dom z papieru"],
    "duration": 20
  },
  {
    "question": "Jak nazywa się waluta Korei Północnej?",
    "options": ["won północnokoreański", "jen", "juan", "rubel"],
    "duration": 20
  }
]
    $json$::jsonb)
  loop
    insert into public.questions (question, duration)
    values (item->>'question', coalesce((item->>'duration')::int, 20))
    returning id into qid;

    -- open question: key goes straight to correct_answers, no options
    if item->>'open_model' is not null then
      insert into public.correct_answers (question_id, correct_option_model)
      values (qid, item->>'open_model');
    end if;

    for opt, ord in
      select value, ordinality
      from jsonb_array_elements_text(item->'options') with ordinality
    loop
      insert into public.options (question_id, option)
      values (qid, opt)
      returning id into oid;

      if ord = 1 then  -- first option = correct
        insert into public.correct_answers (question_id, correct_option_id)
        values (qid, oid);
      end if;
    end loop;
  end loop;
end
$$;