// Курсы под цель: общение на стриме и понимание сериалов. Новые разделы дописывайте в конец своего списка.
const GOAL_TRACKS = [
  { id: 'stream', title: 'Английский для стрима', icon: '🎮', note: 'Как приветствовать зрителей, читать чат, благодарить и просто болтать', units: [
    { title: 'Начало стрима', icon: '👋',
      tip: 'На стриме говорят коротко и живо. Вместо Hello everyone часто слышно Hey guys или What\'s up, chat? Слово chat здесь означает всех зрителей сразу.',
      words: [['stream','трансляция'],['chat','чат, зрители'],['viewer','зритель'],['welcome','добро пожаловать'],['guys','ребята'],['What\'s up?','как дела?, привет'],['go live','начать эфир'],['tonight','сегодня вечером'],['hang out','проводить время вместе'],['glad','рад']],
      phrases: [['Hey guys, welcome to the stream!','Привет, ребята, добро пожаловать на стрим!'],['What\'s up, chat?','Как дела, чат?'],['Can you hear me okay?','Вы меня хорошо слышите?'],['Is the sound okay?','Со звуком всё нормально?'],['Thanks for stopping by','Спасибо, что заглянули'],['Glad you could make it','Рад, что вы пришли'],['We are going to hang out tonight','Сегодня вечером просто потусуемся']] },
    { title: 'Читаем чат', icon: '💬',
      tip: 'Читая сообщение вслух, скажите: Someone says… или Good question. Если не поняли: Sorry, I missed that, can you repeat? Переспрашивать на стриме нормально.',
      words: [['message','сообщение'],['question','вопрос'],['read','читать'],['miss','пропустить'],['repeat','повторить'],['type','печатать'],['good point','верное замечание'],['no idea','понятия не имею'],['exactly','именно'],['I guess','наверное']],
      phrases: [['Let me read the chat','Дайте почитать чат'],['Good question','Хороший вопрос'],['Sorry, I missed that','Извините, я это пропустил'],['Can you type that again?','Можешь написать это ещё раз?'],['I have no idea, to be honest','Честно говоря, понятия не имею'],['You guys are too fast','Вы пишете слишком быстро'],['That\'s a good point','Это верное замечание']] },
    { title: 'Спасибо за поддержку', icon: '💜',
      tip: 'Благодарность звучит теплее с конкретикой: Thanks for the sub, I really appreciate it. Appreciate значит «ценю», это слово стоит запомнить первым.',
      words: [['subscribe','подписаться'],['follow','отслеживать'],['donate','пожертвовать'],['support','поддержка'],['appreciate','ценить'],['means a lot','очень много значит'],['raid','рейд'],['clip','клип'],['community','сообщество'],['generous','щедрый']],
      phrases: [['Thanks for the follow!','Спасибо за подписку!'],['Thank you so much for the sub','Огромное спасибо за подписку'],['I really appreciate it','Я очень это ценю'],['That means a lot to me','Это очень много для меня значит'],['Thanks for the raid, guys','Спасибо за рейд, ребята'],['You are way too generous','Вы слишком щедры'],['This community is the best','Это сообщество лучшее']] },
    { title: 'Игра и реакции', icon: '🕹️',
      tip: 'В эмоциях важен не перевод, а готовые восклицания: No way! Let\'s go! Oh come on! Скажите их вслух несколько раз, чтобы они вылетали сами.',
      words: [['level','уровень'],['boss','босс'],['respawn','возродиться'],['lag','лаг'],['clutch','вытянуть в конце'],['nice try','хорошая попытка'],['close one','было близко'],['unlucky','не повезло'],['try again','попробовать снова'],['GG','хорошая игра']],
      phrases: [['No way, did you see that?','Не может быть, вы это видели?'],['Let\'s go!','Погнали!'],['Oh come on, that wasn\'t fair','Да ладно, это нечестно'],['That was so close','Это было так близко'],['I think the game is lagging','Кажется, игра лагает'],['We will get it next time','В следующий раз получится'],['Good game, everyone','Хорошая игра всем']] },
    { title: 'Болтаем со зрителями', icon: '☕',
      tip: 'Чтобы разговор не затихал, задавайте встречный вопрос: How about you? Where are you from? What are you up to? Ответ можно давать короткий и сразу спрашивать в ответ.',
      words: [['from','из'],['How about you?','а ты?'],['up to','занят чем-либо'],['favorite','любимый'],['recommend','советовать'],['actually','на самом деле'],['kind of','вроде как'],['pretty good','довольно хорошо'],['time zone','часовой пояс'],['weekend','выходные']],
      phrases: [['Where are you guys from?','Откуда вы, ребята?'],['What time is it where you are?','Сколько у вас сейчас времени?'],['What are you up to today?','Что делаешь сегодня?'],['What is your favorite game?','Какая у тебя любимая игра?'],['Can you recommend a good show?','Можешь посоветовать хороший сериал?'],['I am not from the US, actually','Вообще-то я не из США'],['My English is not perfect, but I am learning','Мой английский не идеален, но я учусь']] },
    { title: 'Конец стрима', icon: '🌙',
      tip: 'Прощаются тепло и коротко: That\'s it for today. See you next time. Take care. Часто добавляют, когда следующий эфир: I will be back on Friday.',
      words: [['wrap up','заканчивать'],['that\'s it','на этом всё'],['take care','береги себя'],['next time','в следующий раз'],['be back','вернуться'],['schedule','расписание'],['tired','уставший'],['later','позже'],['have a good one','хорошего дня'],['catch you later','увидимся']],
      phrases: [['That\'s it for today','На сегодня всё'],['I think we should wrap up','Думаю, пора заканчивать'],['Thanks for watching, everyone','Спасибо всем за просмотр'],['I will be back on Friday','Я вернусь в пятницу'],['See you next time, take care','До следующего раза, берегите себя'],['Have a good one, guys','Хорошего вам дня, ребята'],['Catch you later','Увидимся']] }
  ] },
  { id: 'shows', title: 'Английский сериалов', icon: '🎬', note: 'Как говорят на самом деле: сокращения, реакции, сленг и выражения', units: [
    { title: 'Живая речь', icon: '🗣️',
      tip: 'Актёры редко говорят going to. Звучит gonna. Так же want to → wanna, have to → hafta, got to → gotta, kind of → kinda, don\'t know → dunno. Если этого не знать, фразу просто не слышно.',
      words: [['gonna','going to, собираюсь'],['wanna','want to, хочу'],['gotta','got to, должен'],['kinda','kind of, вроде'],['sorta','sort of, отчасти'],['dunno','don\'t know, не знаю'],['lemme','let me, дай мне'],['gimme','give me, дай мне'],['y\'know','you know, знаешь'],['ain\'t','am not, is not, не']],
      phrases: [['I\'m gonna go now','Я, пожалуй, пойду'],['You wanna grab a coffee?','Хочешь выпить кофе?'],['I gotta go','Мне пора'],['I dunno, it\'s kinda weird','Не знаю, это как-то странно'],['Lemme think about it','Дай подумать'],['Gimme a second','Дай секунду'],['It ain\'t over yet','Это ещё не конец']] },
    { title: 'Реакции', icon: '😲',
      tip: 'Половина реплик в сериалах — короткие реакции. Они почти не связаны с дословным переводом: You bet значит «ещё бы», Tell me about it значит «и не говори».',
      words: [['No way!','не может быть!'],['You bet','ещё бы'],['Tell me about it','и не говори'],['Get out of here!','да ладно!'],['For real?','серьёзно?'],['You\'re kidding','ты шутишь'],['My bad','моя вина'],['Fair enough','справедливо'],['Whatever','да какая разница'],['Same here','у меня так же']],
      phrases: [['Are you kidding me?','Ты издеваешься?'],['Wait, for real?','Погоди, серьёзно?'],['Sorry, my bad','Прости, это я виноват'],['Yeah, tell me about it','Да, и не говори'],['Fair enough, you win','Справедливо, ты победил'],['I can\'t believe it','Не могу в это поверить'],['Oh my god, what happened?','Боже мой, что случилось?']] },
    { title: 'Ссоры и чувства', icon: '💢',
      tip: 'В ссорах часто звучит What is your problem? и I\'m done. Заметьте усиление: I am so done, I am sick of this. Sick of значит «сыт по горло», а не «болен».',
      words: [['sick of','сыт по горло'],['fed up','надоело'],['freak out','психовать'],['calm down','успокоиться'],['get over it','забудь уже'],['deal with','разбираться с'],['mess up','всё испортить'],['break up','расстаться'],['figure it out','разобраться'],['leave me alone','оставь меня в покое']],
      phrases: [['What is your problem?','Что с тобой не так?'],['I am sick of this','Меня это достало'],['Calm down, it\'s not a big deal','Успокойся, это мелочь'],['Don\'t freak out','Не психуй'],['I messed up, I know','Я облажался, знаю'],['We need to talk','Нам надо поговорить'],['I can\'t deal with this right now','Я не могу сейчас с этим разбираться']] },
    { title: 'Отношения', icon: '❤️',
      tip: 'Глаголы отношений обычно идут с частицами: ask someone out (пригласить на свидание), hit on (подкатывать), break up with (расстаться с), get back together (сойтись снова).',
      words: [['ask out','пригласить на свидание'],['date','встречаться'],['crush','влюблённость'],['hit on','подкатывать'],['cheat on','изменять'],['get back together','сойтись снова'],['move on','жить дальше'],['ghost','пропасть без объяснений'],['ex','бывший, бывшая'],['single','свободный, без пары']],
      phrases: [['I have a crush on her','Она мне нравится'],['Are you seeing someone?','Ты с кем-то встречаешься?'],['He asked me out','Он пригласил меня на свидание'],['She totally ghosted me','Она просто пропала и не отвечает'],['You need to move on','Тебе пора жить дальше'],['Is that your ex?','Это твоя бывшая?'],['We broke up last week','Мы расстались на прошлой неделе']] },
    { title: 'Сленг', icon: '😎',
      tip: 'Сленг быстро устаревает, поэтому берите самое живое и понятное. Его используют с друзьями, но не на собеседовании. Chill, awesome и dude поймут везде.',
      words: [['awesome','потрясающе'],['cool','круто'],['dude','чувак'],['chill','расслабляться'],['hang out','тусоваться'],['broke','на мели'],['creepy','жуткий'],['lame','отстой'],['sketchy','подозрительный'],['legit','реально, настоящий']],
      phrases: [['That was awesome, dude','Это было потрясающе, чувак'],['Let\'s just chill tonight','Давай просто расслабимся сегодня'],['I am totally broke','Я совсем на мели'],['This place is kind of creepy','Это место какое-то жуткое'],['Is this guy legit?','Этот парень настоящий?'],['That is so lame','Это такой отстой'],['No worries, it\'s all good','Не переживай, всё нормально']] },
    { title: 'Сюжетные фразы', icon: '🕵️',
      tip: 'Эти фразы слышны в каждом детективе и драме. Have your back значит «прикрою тебя», спина здесь ни при чём. Запоминайте целиком.',
      words: [['have your back','прикрыть тебя'],['trust me','поверь мне'],['cover up','скрывать'],['get away with','выйти сухим из воды'],['find out','узнать'],['set up','подставить'],['come clean','признаться'],['in trouble','в беде'],['keep a secret','хранить секрет'],['turn out','оказаться']],
      phrases: [['Don\'t worry, I have your back','Не волнуйся, я тебя прикрою'],['You have to trust me','Ты должен мне поверить'],['He won\'t get away with this','Ему это с рук не сойдёт'],['It turns out she knew everything','Оказалось, она всё знала'],['We have to get out of here','Нам надо убираться отсюда'],['What are you hiding from me?','Что ты от меня скрываешь?'],['I was set up','Меня подставили']] }
  ] }
];

// Что делать вне приложения. Здесь только ссылки: сами материалы принадлежат их авторам.
const WATCH_STEPS = [
  ['Выберите сериал', 'Лёгкий ситком с бытовой речью и короткими сериями. Начинать советуют с Friends: там много повседневной лексики.'],
  ['1. Смотрите одну сцену', 'Возьмите 3–5 минут без субтитров. Попробуйте понять общий смысл.'],
  ['2. Включите английские субтитры', 'Посмотрите ту же сцену ещё раз и выпишите незнакомые фразы.'],
  ['3. Повторяйте вслух', 'Проговаривайте реплики сразу за героем. Короткие занятия по 10–15 минут несколько раз в неделю работают лучше редких длинных.'],
  ['4. Снова без субтитров', 'Посмотрите сцену в третий раз и заметьте, насколько больше стало понятно.']
];
const WATCH_LINKS = [
  ['VOA Learning English', 'https://learningenglish.voanews.com/', 'Бесплатные уроки и новости, тексты рядом с видео'],
  ['BBC Learning English', 'https://www.bbc.co.uk/learningenglish/', 'Короткие уроки и эпизоды 6 Minute English'],
  ['Luke\'s English Podcast', 'https://teacherluke.co.uk/', 'Длинные живые разговоры, подойдёт для выше среднего'],
  ['Learn English With TV Series', 'https://www.youtube.com/@LearnEnglishWithTVSeries', 'Разбор реальных сцен из сериалов']
];
