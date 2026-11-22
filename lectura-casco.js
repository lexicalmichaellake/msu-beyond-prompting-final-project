/*  Casco de seguridad: content for the SSP Reading Booster circle reader.
    Edit this file to change the story, or copy it to make a new chapter.
    There is no build step: save the file and reload the page.

    vocab    The chapter list. "forms" are the exact words the page highlights
             in blue (tap one to see its meaning). Leave "forms" empty for
             words too common to highlight (a, por, que).
    extras   Words that are not on the chapter list but appear in the story.
             They get a dotted underline and a gloss.
    levels   The three readings. Each reading is a list of paragraphs, and each
             paragraph is a list of sentences.
      responses  How learners answer in this reading:
                   "emoji"      ☑️ / ❌ sometimes replace Sí / No, and a question
                                with an "emoji" list sometimes shows those emojis
                   "words"      Sí / No and the short options
                   "sentences"  complete sentences from each question's "full" list
      c          The circle of four questions for each sentence (Blaine Ray).
                 The page asks them in a random order and shuffles the answers.
                   yes     a question whose answer is "Sí"
                   either  an either/or question; "answer" must match one option
                   no      a question whose answer is "No"
                   wh      a question word (¿Qué? ¿Quién? ¿Cómo? ¿Por qué? ...)
                 "then" is what the Profe says after a correct answer.
                 "emoji" (emoji readings): one emoji per option, same order.
                 Use gender-neutral emojis for people (👮 🚶 🚴), never boy,
                 girl, woman or man emojis; use words when no neutral one fits.
                 "full" (sentence readings): for yes/no, ["Sí, …", "No, …"];
                 otherwise one complete sentence per option, same order.
      inference  Questions after the reading. Same fields as the circle
                 questions; leave out "type" for multiple choice.
*/
window.LECTURA = {
  id: "casco",
  title: "Casco de seguridad",
  course: "Español para la policía",

  vocab: [
    { group: "Cognados", es: "el banco", en: "bank", forms: ["banco"] },
    { group: "Cognados", es: "la bicicleta", en: "bicycle", forms: ["bicicleta", "bicicletas"] },
    { group: "Cognados", es: "hispano(a)", en: "Hispanic", forms: ["hispano", "hispana", "hispanos", "hispanas"] },
    { group: "Cognados", es: "el uso", en: "use", forms: ["uso"] },

    { group: "Nombres", es: "el casco de seguridad", en: "safety (bike) helmet", forms: ["casco de seguridad", "casco", "cascos"] },
    { group: "Nombres", es: "la ciudad", en: "city", forms: ["ciudad"] },
    { group: "Nombres", es: "la cuadra", en: "block", forms: ["cuadra", "cuadras"] },
    { group: "Nombres", es: "el estado", en: "state", forms: ["estado"] },
    { group: "Nombres", es: "la hija", en: "daughter", forms: ["hija"] },
    { group: "Nombres", es: "el hijo", en: "son", forms: ["hijo"] },
    { group: "Nombres", es: "la ley", en: "law", forms: ["ley"] },
    { group: "Nombres", es: "la mamá, la madre", en: "mom, mother", forms: ["mamá", "madre"] },
    { group: "Nombres", es: "el (la) muchacho(a)", en: "boy, girl", forms: ["muchacho", "muchacha", "muchachos", "muchachas"] },
    { group: "Nombres", es: "la vida", en: "life", forms: ["vida", "vidas"] },

    { group: "Verbos", es: "andar, caminar", en: "to walk", note: "andar en bicicleta = to ride a bike", forms: ["anda", "andan", "andar", "camina", "caminan", "caminar"] },
    { group: "Verbos", es: "buscar", en: "to look for", forms: ["busca", "busco", "buscar"] },
    { group: "Verbos", es: "deber", en: "must, should", forms: ["debe", "debes", "deben", "deber"] },
    { group: "Verbos", es: "dejar", en: "to leave (behind)", forms: ["deja", "dejo", "dejar"] },
    { group: "Verbos", es: "doblar, voltear (Méx.)", en: "to turn", forms: ["dobla", "doblar", "voltea", "voltear"] },
    { group: "Verbos", es: "exigir", en: "to demand", note: "yo exijo", forms: ["exige", "exigir"] },
    { group: "Verbos", es: "llegar (a)", en: "to arrive (at), to reach", forms: ["llega", "llegan", "llegar"] },
    { group: "Verbos", es: "llevar", en: "to take; to carry; to wear", forms: ["lleva", "llevan", "llevar"] },
    { group: "Verbos", es: "quedar", en: "to be located", forms: ["queda", "quedan"] },
    { group: "Verbos", es: "regresar", en: "to return", forms: ["regresa", "regresar"] },
    { group: "Verbos", es: "salvar", en: "to save", forms: ["salva", "salvar"] },
    { group: "Verbos", es: "solicitar", en: "to ask for", forms: ["solicita", "solicitar"] },
    { group: "Verbos", es: "suceder, pasar", en: "to happen", forms: ["sucede", "pasa"] },
    { group: "Verbos", es: "ver", en: "to see", note: "yo veo", forms: ["ve", "veo", "ver"] },
    { group: "Verbos", es: "vivir", en: "to live", forms: ["vive", "viven", "vivir"] },

    { group: "Adjetivos", es: "este(a)", en: "this", forms: ["este", "esta"] },
    { group: "Adjetivos", es: "grande", en: "big, large", forms: ["grande", "grandes"] },
    { group: "Adjetivos", es: "incómodo(a)", en: "uncomfortable", forms: ["incómodo", "incómoda"] },
    { group: "Adjetivos", es: "muchos(as)", en: "many", forms: ["muchos", "muchas"] },
    { group: "Adjetivos", es: "solo(a)", en: "alone", forms: ["solo", "sola"] },
    { group: "Adjetivos", es: "tu", en: "your", forms: ["tu"] },
    { group: "Adjetivos", es: "unos(as)", en: "about, around", forms: ["unos", "unas"] },

    { group: "Otras palabras y expresiones", es: "a", en: "to, at, on", forms: [] },
    { group: "Otras palabras y expresiones", es: "a la izquierda, a la derecha", en: "to the left, to the right", forms: ["a la izquierda", "a la derecha"] },
    { group: "Otras palabras y expresiones", es: "a pie", en: "on foot", forms: ["a pie"] },
    { group: "Otras palabras y expresiones", es: "a una cuadra de aquí", en: "a block from here", forms: ["a una cuadra de aquí"] },
    { group: "Otras palabras y expresiones", es: "a veces", en: "sometimes", forms: ["a veces"] },
    { group: "Otras palabras y expresiones", es: "además", en: "besides", forms: ["además"] },
    { group: "Otras palabras y expresiones", es: "allá, allí", en: "there", forms: ["allá", "allí"] },
    { group: "Otras palabras y expresiones", es: "¡Ay, de mí!", en: "Oh, goodness gracious!", forms: ["ay, de mí"] },
    { group: "Otras palabras y expresiones", es: "¿cómo?", en: "how?", forms: ["cómo"] },
    { group: "Otras palabras y expresiones", es: "¿cuántos(as)?", en: "how many?", forms: ["cuántos", "cuántas"] },
    { group: "Otras palabras y expresiones", es: "de la mano", en: "hand in hand", forms: ["de la mano"] },
    { group: "Otras palabras y expresiones", es: "desde luego", en: "of course", forms: ["desde luego"] },
    { group: "Otras palabras y expresiones", es: "en bicicleta", en: "on a bike", forms: ["en bicicleta"] },
    { group: "Otras palabras y expresiones", es: "hasta", en: "until", forms: ["hasta"] },
    { group: "Otras palabras y expresiones", es: "llevar puesto(a)", en: "to wear", forms: ["lleva puesto", "lleva puesta", "llevar puesto", "llevan puesto"] },
    { group: "Otras palabras y expresiones", es: "más tarde", en: "later", forms: ["más tarde"] },
    { group: "Otras palabras y expresiones", es: "No me hace caso.", en: "He/She doesn't pay attention to me.", note: "hacer caso = to pay attention", forms: ["no me hace caso", "hace caso"] },
    { group: "Otras palabras y expresiones", es: "por", en: "on (by way of), through", forms: [] },
    { group: "Otras palabras y expresiones", es: "¿por qué?", en: "why?", forms: ["por qué"] },
    { group: "Otras palabras y expresiones", es: "que", en: "who, that", forms: [] },
    { group: "Otras palabras y expresiones", es: "¿qué?", en: "what?, which?", forms: ["qué"] },
    { group: "Otras palabras y expresiones", es: "seguir derecho", en: "to go straight ahead", forms: ["sigue derecho", "seguir derecho", "siguen derecho"] },
    { group: "Otras palabras y expresiones", es: "tarde", en: "late", forms: ["tarde"] },
    { group: "Otras palabras y expresiones", es: "temprano", en: "early", forms: ["temprano"] },
    { group: "Otras palabras y expresiones", es: "todavía", en: "still, yet", note: "todavía no = not yet", forms: ["todavía"] },
    { group: "Otras palabras y expresiones", es: "Vamos.", en: "Let's go.", forms: ["vamos"] },
    { group: "Otras palabras y expresiones", es: "¿verdad?", en: "right?, true?", forms: ["verdad"] },
    { group: "Otras palabras y expresiones", es: "ya", en: "already", note: "ya no = not anymore", forms: ["ya"] }
  ],

  extras: [
    { es: "el / la agente", en: "officer", forms: ["agente"] },
    { es: "dice (decir)", en: "says", forms: ["dice"] },
    { es: "la calle", en: "street", forms: ["calle"] },
    { es: "la escuela", en: "school", forms: ["escuela"] },
    { es: "la casa", en: "house", note: "en casa = at home", forms: ["casa"] },
    { es: "el nombre", en: "name", forms: ["nombre"] },
    { es: "se llama", en: "his/her name is", forms: ["se llama"] },
    { es: "los años", en: "years", note: "tener ... años = to be ... years old", forms: ["años"] },
    { es: "ahora", en: "now", forms: ["ahora"] },
    { es: "porque", en: "because", forms: ["porque"] },
    { es: "sin", en: "without", forms: ["sin"] },
    { es: "pequeño(a)", en: "small", forms: ["pequeña", "pequeño"] },
    { es: "cómodo(a)", en: "comfortable", forms: ["cómodo", "cómoda"] },
    { es: "la familia", en: "family", forms: ["familias", "familia"] },
    { es: "habla (hablar)", en: "speaks, talks", forms: ["habla"] },
    { es: "hace (hacer)", en: "does, makes", forms: ["hace"] },
    { es: "¿quién? ¿quiénes?", en: "who?", forms: ["quién", "quiénes"] },
    { es: "¿dónde?", en: "where?", forms: ["dónde"] },
    { es: "mañana", en: "tomorrow", note: "¡Hasta mañana! = See you tomorrow!", forms: ["mañana"] },
    { es: "al final", en: "at the end", forms: ["al final"] },
    { es: "contento(a)", en: "happy", forms: ["contenta", "contento"] },
    { es: "enojado(a)", en: "angry", forms: ["enojada", "enojado"] },
    { es: "triste", en: "sad", forms: ["triste"] },
    { es: "comprende (comprender)", en: "understands", forms: ["comprende"] },
    { es: "importante", en: "important", forms: ["importante"] },
    { es: "explica (explicar)", en: "explains", forms: ["explica"] },
    { es: "ayuda (ayudar)", en: "helps", forms: ["ayuda"] },
    { es: "aprende (aprender)", en: "learns", forms: ["aprende"] },
    { es: "probablemente", en: "probably", forms: ["probablemente"] },
    { es: "hoy", en: "today", forms: ["hoy"] },
    { es: "el tipo", en: "type, kind", forms: ["tipo"] },
    { es: "la suerte", en: "luck", note: "¿Te sientes con suerte? = Feeling lucky?", forms: ["suerte"] }
  ],

  levels: [
    /* ───────────── LECTURA 1: one paragraph, the bare-bones story; emoji answers ───────────── */
    {
      title: "Lectura 1",
      responses: "emoji",
      blurb: "La historia más corta. Contesta con emojis o palabras. Empieza aquí.",
      intro: "¡Hola! Esta es la Lectura 1, la historia más corta. Lee cada oración y contesta el círculo de preguntas. A veces puedes contestar con emojis. Toca las palabras azules para ver qué significan.",
      paragraphs: [
        [
          { t: "La agente Rivera camina por la ciudad.", c: [
            { type: "yes", ask: "¿La agente Rivera camina por la ciudad?", then: "Sí, la agente Rivera camina por la ciudad." },
            { type: "either", ask: "¿La agente camina o anda en bicicleta?", options: ["Camina", "Anda en bicicleta"], emoji: ["🚶", "🚴"], answer: "Camina", then: "Camina. La agente camina por la ciudad." },
            { type: "no", ask: "¿La agente Rivera anda en bicicleta?", then: "No, la agente no anda en bicicleta. ¡Camina!" },
            { type: "wh", ask: "¿Quién camina por la ciudad?", options: ["La agente Rivera", "El muchacho", "La mamá"], answer: "La agente Rivera", then: "¡La agente Rivera camina por la ciudad!" }
          ] },
          { t: "Ve a un muchacho en bicicleta.", c: [
            { type: "yes", ask: "¿La agente ve a un muchacho en bicicleta?", then: "Sí, la agente ve a un muchacho en bicicleta." },
            { type: "either", ask: "¿Ve a una muchacha o a un muchacho?", options: ["A una muchacha", "A un muchacho"], answer: "A un muchacho", then: "A un muchacho. La agente ve a un muchacho." },
            { type: "no", ask: "¿La agente ve a una muchacha?", then: "No, no ve a una muchacha. Ve a un muchacho." },
            { type: "wh", ask: "¿A quién ve la agente?", options: ["A un muchacho en bicicleta", "A una mamá en bicicleta", "A un muchacho a pie"], answer: "A un muchacho en bicicleta", then: "¡La agente ve a un muchacho en bicicleta!" }
          ] },
          { t: "El muchacho no lleva casco de seguridad.", c: [
            { type: "yes", ask: "¿El muchacho anda sin casco?", then: "Sí, el muchacho anda sin casco." },
            { type: "either", ask: "¿El muchacho lleva casco o no lleva casco?", options: ["Lleva casco", "No lleva casco"], answer: "No lleva casco", then: "No lleva casco. ¡Es un problema!" },
            { type: "no", ask: "¿El muchacho lleva casco de seguridad?", then: "No, el muchacho no lleva casco de seguridad." },
            { type: "wh", ask: "¿Quién anda en bicicleta sin casco?", options: ["El muchacho", "La agente", "La mamá"], answer: "El muchacho", then: "¡El muchacho no lleva casco de seguridad!" }
          ] },
          { t: "La agente dice: “La ley exige el casco”.", c: [
            { type: "yes", ask: "¿La ley exige el casco?", then: "Sí, la ley exige el casco." },
            { type: "either", ask: "¿La ley exige el casco o la bicicleta?", options: ["El casco", "La bicicleta"], answer: "El casco", then: "El casco. La ley exige el casco." },
            { type: "no", ask: "¿La ley exige la bicicleta?", then: "No, la ley no exige la bicicleta. ¡Exige el casco!" },
            { type: "wh", ask: "¿Quién dice: “La ley exige el casco”?", options: ["La agente", "El muchacho", "La mamá"], answer: "La agente", then: "La agente dice: “La ley exige el casco”." }
          ] },
          { t: "La mamá del muchacho llega con el casco.", c: [
            { type: "yes", ask: "¿La mamá del muchacho llega con el casco?", then: "Sí, la mamá llega con el casco." },
            { type: "either", ask: "¿La mamá llega con una bicicleta o con el casco?", options: ["Con una bicicleta", "Con el casco"], answer: "Con el casco", then: "Con el casco. La mamá llega con el casco." },
            { type: "no", ask: "¿La mamá llega con una bicicleta?", then: "No, la mamá no llega con una bicicleta. Llega con el casco." },
            { type: "wh", ask: "¿Quién llega con el casco?", options: ["La mamá del muchacho", "La agente Rivera", "Un muchacho"], answer: "La mamá del muchacho", then: "¡La mamá del muchacho llega con el casco!" }
          ] },
          { t: "Ahora el muchacho lleva el casco.", c: [
            { type: "yes", ask: "¿Ahora el muchacho lleva el casco?", then: "Sí, ahora el muchacho lleva el casco." },
            { type: "either", ask: "¿Quién lleva el casco ahora: el muchacho o la agente?", options: ["El muchacho", "La agente"], emoji: ["🚴", "👮"], answer: "El muchacho", then: "El muchacho lleva el casco." },
            { type: "no", ask: "¿Ahora la agente lleva el casco?", then: "No, la agente no lleva el casco. ¡El muchacho lleva el casco!" },
            { type: "wh", ask: "¿Por qué lleva el casco el muchacho?", options: ["Porque la ley exige el casco", "Porque el casco es grande", "Porque la agente es su mamá"], answer: "Porque la ley exige el casco", then: "Porque la ley exige el casco. ¡Ahora el muchacho lleva el casco!" }
          ] }
        ]
      ],
      inference: [
        { ask: "¿Por qué la mamá llega con el casco?", options: ["Porque el muchacho no lleva casco", "Porque la mamá anda en bicicleta", "Porque la agente no lleva casco"], answer: "Porque el muchacho no lleva casco", then: "El muchacho no lleva casco, y la ley exige el casco." },
        { ask: "¿De quién es el casco?", options: ["Del muchacho", "De la agente", "De la mamá"], answer: "Del muchacho", then: "Es el casco del muchacho: ahora el muchacho lleva el casco." },
        { ask: "Al final, ¿cómo está la agente?", options: ["Contenta", "Enojada", "Triste"], emoji: ["😊", "😠", "😢"], answer: "Contenta", then: "Contenta. Ahora el muchacho lleva el casco: ¡no hay problema!" }
      ]
    },

    /* ───────────── LECTURA 2: two paragraphs, the same story with more detail; word answers ───────────── */
    {
      title: "Lectura 2",
      responses: "words",
      blurb: "La misma historia, con más detalles. Contesta con palabras.",
      intro: "Lectura 2: la misma historia, con más detalles. Lee cada oración y contesta el círculo de preguntas. Ahora contesta con palabras.",
      paragraphs: [
        [
          { t: "Es temprano y la agente Rivera camina por la ciudad.", c: [
            { type: "yes", ask: "¿Es temprano?", then: "Sí, es temprano." },
            { type: "either", ask: "¿Es tarde o es temprano?", options: ["Es tarde", "Es temprano"], answer: "Es temprano", then: "Es temprano. No es tarde." },
            { type: "no", ask: "¿Es tarde?", then: "No, no es tarde. ¡Es temprano!" },
            { type: "wh", ask: "¿Qué hace la agente Rivera?", options: ["Camina por la ciudad", "Anda en bicicleta", "Busca a su hijo"], answer: "Camina por la ciudad", then: "Es temprano y la agente Rivera camina por la ciudad." }
          ] },
          { t: "Ve a un muchacho que anda solo en bicicleta.", c: [
            { type: "yes", ask: "¿El muchacho anda solo?", then: "Sí, el muchacho anda solo." },
            { type: "either", ask: "¿Anda en bicicleta o a pie?", options: ["En bicicleta", "A pie"], answer: "En bicicleta", then: "En bicicleta. El muchacho anda solo en bicicleta." },
            { type: "no", ask: "¿El muchacho anda a pie?", then: "No, el muchacho no anda a pie. Anda en bicicleta." },
            { type: "wh", ask: "¿A quién ve la agente?", options: ["A un muchacho que anda solo", "A un muchacho que anda con su mamá", "A una muchacha que anda a pie"], answer: "A un muchacho que anda solo", then: "La agente ve a un muchacho que anda solo en bicicleta." }
          ] },
          { t: "El muchacho no lleva puesto su casco de seguridad.", c: [
            { type: "yes", ask: "¿El muchacho anda sin casco?", then: "Sí, el muchacho anda sin casco." },
            { type: "either", ask: "¿El muchacho lleva puesto su casco o anda sin casco?", options: ["Lleva puesto su casco", "Anda sin casco"], answer: "Anda sin casco", then: "Anda sin casco. No lleva puesto su casco." },
            { type: "no", ask: "¿El muchacho lleva puesto su casco de seguridad?", then: "No, el muchacho no lleva puesto su casco de seguridad." },
            { type: "wh", ask: "¿Quién anda en bicicleta sin casco?", options: ["El muchacho", "La agente Rivera", "La mamá"], answer: "El muchacho", then: "¡El muchacho no lleva puesto su casco de seguridad!" }
          ] },
          { t: "La agente dice: “La ley del estado exige el uso del casco”.", c: [
            { type: "yes", ask: "¿La ley del estado exige el uso del casco?", then: "Sí, la ley del estado exige el uso del casco." },
            { type: "either", ask: "¿Es una ley del estado o una ley de la ciudad?", options: ["Del estado", "De la ciudad"], answer: "Del estado", then: "Del estado. Es una ley del estado." },
            { type: "no", ask: "¿Es una ley de la ciudad?", then: "No, no es una ley de la ciudad. Es una ley del estado." },
            { type: "wh", ask: "¿Qué exige la ley del estado?", options: ["El uso del casco", "Andar a pie", "Andar con la mamá"], answer: "El uso del casco", then: "La agente dice: “La ley del estado exige el uso del casco”." }
          ] }
        ],
        [
          { t: "El muchacho dice: “El casco es incómodo”.", c: [
            { type: "yes", ask: "¿Para el muchacho, el casco es incómodo?", then: "Sí, para el muchacho, el casco es incómodo." },
            { type: "either", ask: "¿El casco es cómodo o incómodo?", options: ["Cómodo", "Incómodo"], answer: "Incómodo", then: "Incómodo. El muchacho dice: “El casco es incómodo”." },
            { type: "no", ask: "¿El casco es cómodo para el muchacho?", then: "No, el casco no es cómodo. ¡Es incómodo!" },
            { type: "wh", ask: "¿Quién dice: “El casco es incómodo”?", options: ["El muchacho", "La agente", "La mamá"], answer: "El muchacho", then: "El muchacho dice: “El casco es incómodo”." }
          ] },
          { t: "“Es incómodo, ¿verdad? Pero el casco salva vidas”, dice la agente.", c: [
            { type: "yes", ask: "¿El casco salva vidas?", then: "Sí, el casco salva vidas." },
            { type: "either", ask: "¿El casco salva vidas o salva bicicletas?", options: ["Salva vidas", "Salva bicicletas"], answer: "Salva vidas", then: "Salva vidas. ¡El casco salva vidas!" },
            { type: "no", ask: "¿El casco salva bicicletas?", then: "No, el casco no salva bicicletas. ¡Salva vidas!" },
            { type: "wh", ask: "¿Qué dice la agente?", options: ["El casco salva vidas", "El casco es grande", "La bicicleta es incómoda"], answer: "El casco salva vidas", then: "“Es incómodo, ¿verdad? Pero el casco salva vidas”, dice la agente." }
          ] },
          { t: "Más tarde, la mamá del muchacho llega a pie con el casco.", c: [
            { type: "yes", ask: "¿La mamá del muchacho llega con el casco?", then: "Sí, la mamá llega con el casco." },
            { type: "either", ask: "¿La mamá llega en bicicleta o a pie?", options: ["En bicicleta", "A pie"], answer: "A pie", then: "A pie. La mamá llega a pie." },
            { type: "no", ask: "¿La mamá llega en bicicleta?", then: "No, la mamá no llega en bicicleta. Llega a pie." },
            { type: "wh", ask: "¿Qué pasa más tarde?", options: ["La mamá llega a pie con el casco", "La agente regresa al banco", "El muchacho busca a su mamá"], answer: "La mamá llega a pie con el casco", then: "Más tarde, la mamá del muchacho llega a pie con el casco." }
          ] },
          { t: "Ahora el muchacho ya lleva puesto su casco.", c: [
            { type: "yes", ask: "¿Ahora el muchacho lleva puesto su casco?", then: "Sí, ahora el muchacho lleva puesto su casco." },
            { type: "either", ask: "¿Ya lleva puesto su casco o todavía no?", options: ["Ya lleva puesto su casco", "Todavía no"], answer: "Ya lleva puesto su casco", then: "Ya lleva puesto su casco." },
            { type: "no", ask: "¿El muchacho todavía anda sin casco?", then: "No, ya no anda sin casco. ¡Ya lleva puesto su casco!" },
            { type: "wh", ask: "¿Por qué lleva puesto el casco?", options: ["Porque el casco salva vidas", "Porque el casco es incómodo", "Porque es tarde"], answer: "Porque el casco salva vidas", then: "Porque el casco salva vidas. ¡Ahora el muchacho ya lleva puesto su casco!" }
          ] }
        ]
      ],
      inference: [
        { ask: "¿Por qué el muchacho no lleva puesto su casco?", options: ["Porque es incómodo", "Porque es tarde", "Porque la ley no exige el casco"], answer: "Porque es incómodo", then: "El muchacho dice: “El casco es incómodo”." },
        { type: "yes", ask: "¿La agente comprende al muchacho?", then: "Sí. La agente dice: “Es incómodo, ¿verdad?”." },
        { ask: "Temprano, ¿quién tiene el casco del muchacho?", options: ["Su mamá", "La agente", "El muchacho"], answer: "Su mamá", then: "Su mamá. Más tarde, la mamá llega a pie con el casco." },
        { ask: "Para la agente, ¿qué es más importante?", options: ["La vida del muchacho", "Un casco cómodo", "Andar temprano"], answer: "La vida del muchacho", then: "La agente dice: “El casco salva vidas”." }
      ]
    },

    /* ───────────── LECTURA 3: three paragraphs, the full story; complete-sentence answers ───────────── */
    {
      title: "Lectura 3",
      responses: "sentences",
      blurb: "La historia completa. Contesta con oraciones completas. ¡La más difícil!",
      intro: "Lectura 3: la historia completa, con tres párrafos. ¡Es la más difícil! Lee cada oración y contesta el círculo de preguntas con oraciones completas.",
      paragraphs: [
        [
          { t: "Es temprano y la agente Rivera camina por la ciudad, a una cuadra del banco.", c: [
            { type: "yes", ask: "¿La agente Rivera camina a una cuadra del banco?", then: "Sí, camina a una cuadra del banco.",
              full: ["Sí, la agente Rivera camina a una cuadra del banco.", "No, la agente Rivera no camina a una cuadra del banco."] },
            { type: "either", ask: "¿Camina a una cuadra del banco o a una cuadra de la escuela?", options: ["Del banco", "De la escuela"], answer: "Del banco", then: "Del banco. Camina a una cuadra del banco.",
              full: ["Camina a una cuadra del banco.", "Camina a una cuadra de la escuela."] },
            { type: "no", ask: "¿La agente camina a una cuadra de la escuela?", then: "No, no camina a una cuadra de la escuela. Camina a una cuadra del banco.",
              full: ["Sí, la agente camina a una cuadra de la escuela.", "No, la agente no camina a una cuadra de la escuela."] },
            { type: "wh", ask: "¿Dónde camina la agente Rivera?", options: ["Por la ciudad, a una cuadra del banco", "En el banco", "Por la escuela"], answer: "Por la ciudad, a una cuadra del banco", then: "Es temprano y la agente Rivera camina por la ciudad, a una cuadra del banco.",
              full: ["La agente camina por la ciudad, a una cuadra del banco.", "La agente camina en el banco.", "La agente camina por la escuela."] }
          ] },
          { t: "Muchas familias hispanas viven en esta ciudad grande.", c: [
            { type: "yes", ask: "¿Muchas familias hispanas viven en esta ciudad?", then: "Sí, muchas familias hispanas viven en esta ciudad.",
              full: ["Sí, muchas familias hispanas viven en esta ciudad.", "No, muchas familias hispanas no viven en esta ciudad."] },
            { type: "either", ask: "¿La ciudad es pequeña o grande?", options: ["Pequeña", "Grande"], answer: "Grande", then: "Grande. Es una ciudad grande.",
              full: ["La ciudad es pequeña.", "La ciudad es grande."] },
            { type: "no", ask: "¿La ciudad es pequeña?", then: "No, la ciudad no es pequeña. ¡Es grande!",
              full: ["Sí, la ciudad es pequeña.", "No, la ciudad no es pequeña."] },
            { type: "wh", ask: "¿Cuántas familias hispanas viven en la ciudad?", options: ["Muchas", "Una", "Dos"], answer: "Muchas", then: "Muchas familias hispanas viven en esta ciudad grande.",
              full: ["Muchas familias hispanas viven en la ciudad.", "Una familia hispana vive en la ciudad.", "Dos familias hispanas viven en la ciudad."] }
          ] },
          { t: "La agente ve a un muchacho que anda solo en bicicleta por la calle.", c: [
            { type: "yes", ask: "¿El muchacho anda en bicicleta por la calle?", then: "Sí, el muchacho anda en bicicleta por la calle.",
              full: ["Sí, el muchacho anda en bicicleta por la calle.", "No, el muchacho no anda en bicicleta por la calle."] },
            { type: "either", ask: "¿El muchacho anda solo o con muchos muchachos?", options: ["Solo", "Con muchos muchachos"], answer: "Solo", then: "Solo. El muchacho anda solo.",
              full: ["El muchacho anda solo.", "El muchacho anda con muchos muchachos."] },
            { type: "no", ask: "¿El muchacho anda con muchos muchachos?", then: "No, no anda con muchos muchachos. ¡Anda solo!",
              full: ["Sí, el muchacho anda con muchos muchachos.", "No, el muchacho no anda con muchos muchachos."] },
            { type: "wh", ask: "¿Por dónde anda el muchacho?", options: ["Por la calle", "Por el banco", "Por la escuela"], answer: "Por la calle", then: "La agente ve a un muchacho que anda solo en bicicleta por la calle.",
              full: ["El muchacho anda por la calle.", "El muchacho anda por el banco.", "El muchacho anda por la escuela."] }
          ] },
          { t: "El muchacho no lleva puesto su casco de seguridad.", c: [
            { type: "yes", ask: "¿El muchacho anda en bicicleta sin casco?", then: "Sí, anda en bicicleta sin casco.",
              full: ["Sí, el muchacho anda en bicicleta sin casco.", "No, el muchacho no anda en bicicleta sin casco."] },
            { type: "either", ask: "¿El muchacho lleva puesto su casco o anda sin casco?", options: ["Lleva puesto su casco", "Anda sin casco"], answer: "Anda sin casco", then: "Anda sin casco. ¡Es un problema!",
              full: ["El muchacho lleva puesto su casco.", "El muchacho anda sin casco."] },
            { type: "no", ask: "¿El muchacho lleva puesto su casco de seguridad?", then: "No, el muchacho no lleva puesto su casco de seguridad.",
              full: ["Sí, el muchacho lleva puesto su casco de seguridad.", "No, el muchacho no lleva puesto su casco de seguridad."] },
            { type: "wh", ask: "¿Quién anda en bicicleta sin casco?", options: ["El muchacho", "La agente Rivera", "Una familia hispana"], answer: "El muchacho", then: "¡El muchacho no lleva puesto su casco de seguridad!",
              full: ["El muchacho anda en bicicleta sin casco.", "La agente Rivera anda en bicicleta sin casco.", "Una familia hispana anda en bicicleta sin casco."] }
          ] }
        ],
        [
          { t: "La agente solicita su nombre: se llama Marcos y tiene unos doce años.", c: [
            { type: "yes", ask: "¿La agente solicita el nombre del muchacho?", then: "Sí, la agente solicita su nombre.",
              full: ["Sí, la agente solicita el nombre del muchacho.", "No, la agente no solicita el nombre del muchacho."] },
            { type: "either", ask: "¿El muchacho se llama Marcos o Pablo?", options: ["Marcos", "Pablo"], answer: "Marcos", then: "Marcos. El muchacho se llama Marcos.",
              full: ["El muchacho se llama Marcos.", "El muchacho se llama Pablo."] },
            { type: "no", ask: "¿El muchacho se llama Pablo?", then: "No, no se llama Pablo. Se llama Marcos.",
              full: ["Sí, el muchacho se llama Pablo.", "No, el muchacho no se llama Pablo."] },
            { type: "wh", ask: "¿Cuántos años tiene Marcos?", options: ["Unos doce años", "Unos cuarenta años", "Unos dos años"], answer: "Unos doce años", then: "Se llama Marcos y tiene unos doce años.",
              full: ["Marcos tiene unos doce años.", "Marcos tiene unos cuarenta años.", "Marcos tiene unos dos años."] }
          ] },
          { t: "La agente dice: “Marcos, la ley del estado exige el uso del casco”.", c: [
            { type: "yes", ask: "¿La ley del estado exige el uso del casco?", then: "Sí, la ley del estado exige el uso del casco.",
              full: ["Sí, la ley del estado exige el uso del casco.", "No, la ley del estado no exige el uso del casco."] },
            { type: "either", ask: "¿La agente habla con la mamá o con Marcos?", options: ["Con la mamá", "Con Marcos"], answer: "Con Marcos", then: "Con Marcos. La agente habla con Marcos.",
              full: ["La agente habla con la mamá.", "La agente habla con Marcos."] },
            { type: "no", ask: "¿La agente habla con la mamá?", then: "No, la agente no habla con la mamá. Habla con Marcos.",
              full: ["Sí, la agente habla con la mamá.", "No, la agente no habla con la mamá."] },
            { type: "wh", ask: "¿Qué exige la ley del estado?", options: ["El uso del casco", "Andar a pie", "Andar con la mamá"], answer: "El uso del casco", then: "La agente dice: “Marcos, la ley del estado exige el uso del casco”.",
              full: ["La ley del estado exige el uso del casco.", "La ley del estado exige andar a pie.", "La ley del estado exige andar con la mamá."] }
          ] },
          { t: "Marcos dice: “A veces dejo el casco en casa porque es incómodo”.", c: [
            { type: "yes", ask: "¿A veces Marcos deja el casco en casa?", then: "Sí, a veces Marcos deja el casco en casa.",
              full: ["Sí, a veces Marcos deja el casco en casa.", "No, Marcos no deja el casco en casa."] },
            { type: "either", ask: "¿Deja el casco en casa o en la escuela?", options: ["En casa", "En la escuela"], answer: "En casa", then: "En casa. Marcos deja el casco en casa.",
              full: ["Marcos deja el casco en casa.", "Marcos deja el casco en la escuela."] },
            { type: "no", ask: "¿Marcos deja el casco en la escuela?", then: "No, no deja el casco en la escuela. Deja el casco en casa.",
              full: ["Sí, Marcos deja el casco en la escuela.", "No, Marcos no deja el casco en la escuela."] },
            { type: "wh", ask: "¿Por qué deja Marcos el casco en casa?", options: ["Porque es incómodo", "Porque es grande", "Porque salva vidas"], answer: "Porque es incómodo", then: "Marcos dice: “A veces dejo el casco en casa porque es incómodo”.",
              full: ["Deja el casco en casa porque es incómodo.", "Deja el casco en casa porque es grande.", "Deja el casco en casa porque salva vidas."] }
          ] },
          { t: "“Es incómodo, ¿verdad? Pero debes llevar tu casco: ¡salva vidas!”, dice la agente.", c: [
            { type: "yes", ask: "¿Marcos debe llevar su casco?", then: "¡Desde luego! Marcos debe llevar su casco.",
              full: ["Sí, Marcos debe llevar su casco.", "No, Marcos no debe llevar su casco."] },
            { type: "either", ask: "¿El casco salva vidas o salva bicicletas?", options: ["Salva vidas", "Salva bicicletas"], answer: "Salva vidas", then: "Salva vidas. ¡El casco salva vidas!",
              full: ["El casco salva vidas.", "El casco salva bicicletas."] },
            { type: "no", ask: "¿Marcos debe dejar su casco en casa?", then: "No, Marcos no debe dejar su casco en casa. ¡Debe llevar su casco!",
              full: ["Sí, Marcos debe dejar su casco en casa.", "No, Marcos no debe dejar su casco en casa."] },
            { type: "wh", ask: "¿Por qué debe llevar Marcos su casco?", options: ["Porque el casco salva vidas", "Porque el casco es incómodo", "Porque es temprano"], answer: "Porque el casco salva vidas", then: "Porque el casco salva vidas. Además, la ley del estado exige el uso del casco.",
              full: ["Debe llevar su casco porque el casco salva vidas.", "Debe llevar su casco porque el casco es incómodo.", "Debe llevar su casco porque es temprano."] }
          ] }
        ],
        [
          { t: "Más tarde, la madre de Marcos llega a pie, de la mano con su hija.", c: [
            { type: "yes", ask: "¿La madre de Marcos llega a pie?", then: "Sí, la madre de Marcos llega a pie.",
              full: ["Sí, la madre de Marcos llega a pie.", "No, la madre de Marcos no llega a pie."] },
            { type: "either", ask: "¿Llega de la mano con la agente o con su hija?", options: ["Con la agente", "Con su hija"], answer: "Con su hija", then: "Con su hija. Llega de la mano con su hija.",
              full: ["Llega de la mano con la agente.", "Llega de la mano con su hija."] },
            { type: "no", ask: "¿La madre llega de la mano con la agente?", then: "No, no llega con la agente. Llega de la mano con su hija.",
              full: ["Sí, la madre llega de la mano con la agente.", "No, la madre no llega de la mano con la agente."] },
            { type: "wh", ask: "¿Qué sucede más tarde?", options: ["La madre de Marcos llega a pie con su hija", "Marcos regresa a casa solo", "La agente busca el banco"], answer: "La madre de Marcos llega a pie con su hija", then: "Más tarde, la madre de Marcos llega a pie, de la mano con su hija.",
              full: ["Más tarde, la madre de Marcos llega a pie con su hija.", "Más tarde, Marcos regresa a casa solo.", "Más tarde, la agente busca el banco."] }
          ] },
          { t: "La mamá lleva el casco y dice: “¡Ay, de mí! Mi hijo no me hace caso”.", c: [
            { type: "yes", ask: "¿La mamá lleva el casco de Marcos?", then: "Sí, la mamá lleva el casco de Marcos.",
              full: ["Sí, la mamá lleva el casco de Marcos.", "No, la mamá no lleva el casco de Marcos."] },
            { type: "either", ask: "¿La mamá lleva el casco o la bicicleta?", options: ["El casco", "La bicicleta"], answer: "El casco", then: "El casco. La mamá lleva el casco.",
              full: ["La mamá lleva el casco.", "La mamá lleva la bicicleta."] },
            { type: "no", ask: "¿Marcos hace caso a su mamá?", then: "No, Marcos no hace caso a su mamá. ¡Ay, de mí!",
              full: ["Sí, Marcos hace caso a su mamá.", "No, Marcos no hace caso a su mamá."] },
            { type: "wh", ask: "¿Qué dice la mamá?", options: ["“Mi hijo no me hace caso”", "“Mi hija no me hace caso”", "“El casco es incómodo”"], answer: "“Mi hijo no me hace caso”", then: "La mamá dice: “¡Ay, de mí! Mi hijo no me hace caso”.",
              full: ["La mamá dice: “Mi hijo no me hace caso”.", "La mamá dice: “Mi hija no me hace caso”.", "La mamá dice: “El casco es incómodo”."] }
          ] },
          { t: "Ahora Marcos ya lleva puesto su casco de seguridad.", c: [
            { type: "yes", ask: "¿Ahora Marcos lleva puesto su casco?", then: "Sí, ahora Marcos lleva puesto su casco.",
              full: ["Sí, ahora Marcos lleva puesto su casco.", "No, Marcos no lleva puesto su casco."] },
            { type: "either", ask: "¿Marcos todavía anda sin casco o ya lleva puesto su casco?", options: ["Todavía anda sin casco", "Ya lleva puesto su casco"], answer: "Ya lleva puesto su casco", then: "Ya lleva puesto su casco.",
              full: ["Marcos todavía anda sin casco.", "Marcos ya lleva puesto su casco."] },
            { type: "no", ask: "¿Marcos todavía anda sin casco?", then: "No, Marcos ya no anda sin casco.",
              full: ["Sí, Marcos todavía anda sin casco.", "No, Marcos ya no anda sin casco."] },
            { type: "wh", ask: "¿Por qué tiene Marcos su casco ahora?", options: ["Porque su mamá llega con el casco", "Porque la agente tiene un casco", "Porque Marcos regresa a casa"], answer: "Porque su mamá llega con el casco", then: "Porque su mamá llega con el casco. ¡Ahora Marcos ya lleva puesto su casco de seguridad!",
              full: ["Tiene su casco porque su mamá llega con el casco.", "Tiene su casco porque la agente tiene un casco.", "Tiene su casco porque Marcos regresa a casa."] }
          ] },
          { t: "La escuela queda a una cuadra de aquí: Marcos sigue derecho y dobla a la derecha.", c: [
            { type: "yes", ask: "¿La escuela queda a una cuadra de aquí?", then: "Sí, la escuela queda a una cuadra de aquí. ¡Vamos, Marcos!",
              full: ["Sí, la escuela queda a una cuadra de aquí.", "No, la escuela no queda a una cuadra de aquí."] },
            { type: "either", ask: "¿Marcos dobla a la izquierda o a la derecha?", options: ["A la izquierda", "A la derecha"], answer: "A la derecha", then: "A la derecha. La escuela está allí.",
              full: ["Marcos dobla a la izquierda.", "Marcos dobla a la derecha."] },
            { type: "no", ask: "¿Marcos dobla a la izquierda?", then: "No, no dobla a la izquierda. Dobla a la derecha. En México también dicen: “voltea a la derecha”.",
              full: ["Sí, Marcos dobla a la izquierda.", "No, Marcos no dobla a la izquierda."] },
            { type: "wh", ask: "¿Cómo llega Marcos a la escuela?", options: ["Sigue derecho y dobla a la derecha", "Sigue derecho y dobla a la izquierda", "Regresa a casa a pie"], answer: "Sigue derecho y dobla a la derecha", then: "Sigue derecho y dobla a la derecha. ¡Hasta mañana, Marcos!",
              full: ["Marcos sigue derecho y dobla a la derecha.", "Marcos sigue derecho y dobla a la izquierda.", "Marcos regresa a casa a pie."] }
          ] }
        ]
      ],
      inference: [
        { ask: "¿Por qué la mamá dice: “Mi hijo no me hace caso”?", options: ["Porque Marcos a veces deja el casco en casa.", "Porque Marcos no habla con la agente.", "Porque Marcos vive a una cuadra del banco."], answer: "Porque Marcos a veces deja el casco en casa.", then: "Marcos dice: “A veces dejo el casco en casa porque es incómodo”." },
        { ask: "¿Qué tipo de agente es Rivera?", options: ["Es una agente que explica la ley y ayuda a Marcos.", "Es una agente que no habla con los muchachos.", "Es una agente que no comprende a Marcos."], answer: "Es una agente que explica la ley y ayuda a Marcos.", then: "La agente explica la ley y dice: “Es incómodo, ¿verdad?”." },
        { ask: "¿Por qué la madre lleva a su hija de la mano?", options: ["Probablemente porque su hija es pequeña.", "Porque su hija anda en bicicleta.", "Porque su hija no vive en la ciudad."], answer: "Probablemente porque su hija es pequeña.", then: "Llegan a pie, de la mano: la hija probablemente es pequeña." },
        { ask: "¿Marcos llega tarde a la escuela?", options: ["No, porque es temprano y la escuela queda a una cuadra.", "Sí, porque la escuela queda a muchas cuadras.", "Sí, porque Marcos regresa a casa."], answer: "No, porque es temprano y la escuela queda a una cuadra.", then: "Es temprano, y la escuela queda a una cuadra de aquí." },
        { ask: "¿Qué aprende Marcos hoy?", options: ["Aprende que debe llevar su casco porque salva vidas.", "Aprende que el casco es cómodo.", "Aprende que la ley exige andar a pie."], answer: "Aprende que debe llevar su casco porque salva vidas.", then: "La agente dice: “Debes llevar tu casco: ¡salva vidas!”." }
      ]
    }
  ]
};
