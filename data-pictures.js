// Разделы с картинками. pics: true — больше заданий «скажи, что на картинке», scene: true — «что он делает?».
// Новые разделы дописывайте только в конец. Картинка — эмодзи или свой SVG с классом ic.
const WARDROBE = '<svg class="ic" viewBox="0 0 64 64"><rect x="10" y="4" width="44" height="52" rx="3" fill="#a9713f"/><rect x="14" y="8" width="17" height="44" fill="#c98f5a"/><rect x="33" y="8" width="17" height="44" fill="#c98f5a"/><circle cx="28" cy="30" r="2" fill="#5a3a1c"/><circle cx="36" cy="30" r="2" fill="#5a3a1c"/><rect x="14" y="56" width="6" height="6" fill="#7c4f28"/><rect x="44" y="56" width="6" height="6" fill="#7c4f28"/></svg>';
UNITS.push(
  // ---------- A1 ----------
  { lvl: 'A1', title: 'Природа', icon: '🌊', pics: true,
    words: [['sea','море','🌊'],['mountain','гора','⛰️'],['river','река','🏞️'],['beach','пляж','🏖️'],['island','остров','🏝️'],['tree','дерево','🌳'],['flower','цветок','🌸'],['desert','пустыня','🏜️'],['star','звезда','⭐'],['grass','трава','🌿']],
    phrases: [['The sea is blue today','Сегодня море синее'],['We live near a river','Мы живём около реки'],['There are many stars at night','Ночью много звёзд'],['I see a big mountain','Я вижу большую гору'],['This flower is beautiful','Этот цветок красивый']] },
  { lvl: 'A1', title: 'Фрукты и овощи', icon: '🍌', pics: true,
    words: [['banana','банан','🍌'],['orange','апельсин','🍊'],['grapes','виноград','🍇'],['lemon','лимон','🍋'],['strawberry','клубника','🍓'],['tomato','помидор','🍅'],['potato','картофель','🥔'],['carrot','морковь','🥕'],['onion','лук','🧅'],['cucumber','огурец','🥒']],
    phrases: [['I like bananas and oranges','Я люблю бананы и апельсины'],['The lemon is sour','Лимон кислый'],['She is cutting a tomato','Она режет помидор'],['We need three potatoes','Нам нужно три картофелины'],['Do you want some grapes?','Хочешь винограда?']] },
  { lvl: 'A1', title: 'Что он делает?', icon: '🏃', pics: true, scene: true,
    tip: 'Чтобы сказать, что человек делает прямо сейчас: He is + глагол с -ing. He is running — он бежит. She is singing — она поёт.',
    words: [['running','бежит','🏃'],['swimming','плавает','🏊'],['dancing','танцует','💃'],['singing','поёт','🎤'],['sleeping','спит','😴'],['reading','читает','📖'],['writing','пишет','✍️'],['cooking','готовит','🍳'],['driving','ведёт машину','🚗'],['walking','идёт пешком','🚶']],
    phrases: [['He is running in the park','Он бежит в парке'],['She is singing a song','Она поёт песню'],['They are swimming in the sea','Они плавают в море'],['The baby is sleeping','Малыш спит'],['What are you cooking?','Что ты готовишь?']] },

  // ---------- A2 ----------
  { lvl: 'A2', title: 'Вещи в доме', icon: '🛋️', pics: true,
    words: [['wardrobe','шкаф',WARDROBE],['sofa','диван','🛋️'],['lamp','лампа','💡'],['clock','часы','🕰️'],['candle','свеча','🕯️'],['basket','корзина','🧺'],['broom','метла','🧹'],['bucket','ведро','🪣'],['ladder','лестница','🪜'],['bathtub','ванна','🛁']],
    phrases: [['My clothes are in the wardrobe','Моя одежда в шкафу'],['Put the lamp on the table','Поставь лампу на стол'],['The clock has stopped','Часы остановились'],['She lit a candle','Она зажгла свечу'],['Could you bring the ladder?','Можешь принести лестницу?']] },
  { lvl: 'A2', title: 'Что они делают?', icon: '🚴', pics: true, scene: true,
    tip: 'После love, like, hate, enjoy действие обычно стоит с -ing: She loves skiing. После go — занятия: go fishing, go shopping.',
    words: [['cycling','едет на велосипеде','🚴'],['climbing','лезет вверх','🧗'],['surfing','катается на волнах','🏄'],['skiing','катается на лыжах','⛷️'],['fishing','рыбачит','🎣'],['painting','рисует красками','🎨'],['shopping','ходит по магазинам','🛍️'],['crying','плачет','😭'],['laughing','смеётся','😂'],['juggling','жонглирует','🤹']],
    phrases: [['He goes fishing every Sunday','Он ходит на рыбалку каждое воскресенье'],['Why is the baby crying?','Почему малыш плачет?'],['I was laughing all evening','Я смеялся весь вечер'],['She loves skiing in winter','Она любит кататься на лыжах зимой'],['They are climbing a high mountain','Они поднимаются на высокую гору']] },

  // ---------- B1 ----------
  { lvl: 'B1', title: 'Инструменты', icon: '🔧', pics: true,
    words: [['hammer','молоток','🔨'],['saw','пила','🪚'],['screwdriver','отвёртка','🪛'],['wrench','гаечный ключ','🔧'],['scissors','ножницы','✂️'],['axe','топор','🪓'],['needle','игла','🪡'],['magnifying glass','лупа','🔍'],['flashlight','фонарик','🔦'],['compass','компас','🧭']],
    phrases: [['I need a hammer and some nails','Мне нужны молоток и гвозди'],['The scissors are not sharp enough','Ножницы недостаточно острые'],['Use a compass to find the way','Используй компас, чтобы найти дорогу'],['My flashlight has stopped working','Мой фонарик перестал работать'],['He fixed the chair with a screwdriver','Он починил стул отвёрткой']] },
  { lvl: 'B1', title: 'Транспорт', icon: '🚁', pics: true,
    words: [['bicycle','велосипед','🚲'],['bus','автобус','🚌'],['ship','корабль','🚢'],['helicopter','вертолёт','🚁'],['motorcycle','мотоцикл','🏍️'],['rocket','ракета','🚀'],['ambulance','скорая помощь','🚑'],['fire engine','пожарная машина','🚒'],['taxi','такси','🚕'],['truck','грузовик','🚚']],
    phrases: [['The ambulance arrived within minutes','Скорая приехала через несколько минут'],['We took a taxi to the airport','Мы взяли такси до аэропорта'],['A rocket was launched this morning','Этим утром запустили ракету'],['The ship sailed across the ocean','Корабль переплыл океан'],['He used to ride a motorcycle','Раньше он ездил на мотоцикле']] },

  // ---------- B2 ----------
  { lvl: 'B2', title: 'Дикая природа', icon: '🐘', pics: true,
    words: [['elephant','слон','🐘'],['giraffe','жираф','🦒'],['monkey','обезьяна','🐒'],['penguin','пингвин','🐧'],['whale','кит','🐋'],['shark','акула','🦈'],['crocodile','крокодил','🐊'],['butterfly','бабочка','🦋'],['owl','сова','🦉'],['squirrel','белка','🐿️']],
    phrases: [['Elephants have an excellent memory','У слонов отличная память'],['Sharks have been living in the oceans for millions of years','Акулы живут в океанах миллионы лет'],['If I saw a crocodile, I would run','Увидев крокодила, я бы побежал'],['Owls hunt at night','Совы охотятся ночью'],['The penguin cannot fly','Пингвин не умеет летать']] },
  { lvl: 'B2', title: 'Явления природы', icon: '🌈', pics: true,
    words: [['rainbow','радуга','🌈'],['lightning','молния','⚡'],['tornado','торнадо','🌪️'],['volcano','вулкан','🌋'],['fog','туман','🌫️'],['wave','волна','🌊'],['comet','комета','☄️'],['glacier','ледник','🏔️'],['sunset','закат','🌇'],['galaxy','галактика','🌌']],
    phrases: [['A rainbow appeared after the storm','После грозы появилась радуга'],['The tornado had destroyed the village before we arrived','Торнадо разрушил деревню до нашего приезда'],['The volcano is expected to erupt soon','Ожидается, что вулкан скоро извергнется'],['Lightning struck the old tree','Молния ударила в старое дерево'],['Glaciers are melting faster than ever','Ледники тают быстрее, чем когда-либо']] },

  // ---------- C1 ----------
  { lvl: 'C1', title: 'Символы и предметы', icon: '⚓', pics: true,
    tip: 'Инверсия вместо if в формальной речи: Had we known… = If we had known… Should you need help… = If you need help…',
    words: [['anchor','якорь','⚓'],['telescope','телескоп','🔭'],['trophy','кубок','🏆'],['scales','весы','⚖️'],['shield','щит','🛡️'],['crown','корона','👑'],['dagger','кинжал','🗡️'],['chain','цепь','⛓️'],['hourglass','песочные часы','⏳'],['thermometer','термометр','🌡️']],
    phrases: [['The scales of justice must remain balanced','Весы правосудия должны оставаться в равновесии'],['Time slipped away like sand in an hourglass','Время утекало, как песок в песочных часах'],['A chain is only as strong as its weakest link','Цепь прочна лишь настолько, насколько прочно её самое слабое звено'],['Had we brought a telescope, we would have seen it','Будь у нас телескоп, мы бы это увидели'],['The crown was passed down through generations','Корона передавалась из поколения в поколение']] }
);
