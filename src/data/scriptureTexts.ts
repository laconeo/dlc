export interface ScriptureVerse {
  verseNumber: number | string;
  text: string;
}

export interface ScripturePassage {
  day: number;
  reference: string;
  contextSummary: string;
  verses: ScriptureVerse[];
}

export const SCRIPTURE_HEADERS: Record<number, { book: string; subtitle: string; testament: string }> = {
  1: { book: 'JOSUÉ', subtitle: 'Capítulo 1:5–11', testament: 'Antiguo Testamento' },
  2: { book: 'GÉNESIS', subtitle: 'Capítulo 45:5–8', testament: 'Antiguo Testamento' },
  3: { book: 'JUECES', subtitle: 'Capítulo 2:16, 18', testament: 'Antiguo Testamento' },
  4: { book: 'JUECES', subtitle: 'Capítulo 4:3–4, 6–8, 14', testament: 'Antiguo Testamento' },
  5: { book: 'JUECES', subtitle: 'Capítulo 6:12–18', testament: 'Antiguo Testamento' },
  6: { book: 'RUT', subtitle: 'Capítulo 1:16–17 · Capítulo 2:2', testament: 'Antiguo Testamento' },
  7: { book: '1 SAMUEL', subtitle: 'Capítulo 1:10, 12–13, 17–18', testament: 'Antiguo Testamento' },
  8: { book: 'RUT', subtitle: 'Capítulo 2:8–12', testament: 'Antiguo Testamento' },
  9: { book: '1 SAMUEL', subtitle: 'Capítulo 14:6–8', testament: 'Antiguo Testamento' },
  10: { book: '1 SAMUEL', subtitle: 'Capítulo 16:7, 13', testament: 'Antiguo Testamento' },
  11: { book: '1 REYES', subtitle: 'Capítulo 3:5, 9, 12, 14', testament: 'Antiguo Testamento' },
  12: { book: '1 REYES', subtitle: 'Capítulo 17:1–4', testament: 'Antiguo Testamento' },
  13: { book: '2 REYES', subtitle: 'Capítulo 2:1, 8–9', testament: 'Antiguo Testamento' },
  14: { book: '2 REYES', subtitle: 'Capítulo 5:10–11, 13', testament: 'Antiguo Testamento' },
  15: { book: '2 REYES', subtitle: 'Capítulo 18:3–7', testament: 'Antiguo Testamento' },
  16: { book: '2 CRÓNICAS', subtitle: 'Capítulo 34:3', testament: 'Antiguo Testamento' },
  17: { book: 'GÉNESIS', subtitle: 'Capítulo 9:8, 11–15', testament: 'Antiguo Testamento' },
  18: { book: 'ESTER', subtitle: 'Capítulo 4:15–16', testament: 'Antiguo Testamento' },
  19: { book: 'ESTER', subtitle: 'Capítulo 4:13–14', testament: 'Antiguo Testamento' },
  20: { book: 'RUT', subtitle: 'Capítulo 3:1–5', testament: 'Antiguo Testamento' },
  21: { book: 'MOISÉS', subtitle: 'Capítulo 1:1–4, 6', testament: 'Perla de Gran Precio' },
  22: { book: 'MOISÉS', subtitle: 'Capítulo 7:13', testament: 'Perla de Gran Precio' },
  23: { book: 'JOB', subtitle: 'Capítulo 19:23–27', testament: 'Antiguo Testamento' },
  24: { book: 'JEREMÍAS', subtitle: 'Capítulo 31:3', testament: 'Antiguo Testamento' },
  25: { book: 'GÉNESIS', subtitle: 'Capítulo 24:14–20', testament: 'Antiguo Testamento' },
  26: { book: 'DANIEL', subtitle: 'Capítulo 1:8–12, 19', testament: 'Antiguo Testamento' },
  27: { book: 'ÉXODO', subtitle: 'Capítulo 18:14–15, 17–19', testament: 'Antiguo Testamento' },
  28: { book: '2 REYES', subtitle: 'Capítulo 5:13, 14–15', testament: 'Antiguo Testamento' },
  29: { book: '1 SAMUEL', subtitle: 'Capítulo 3:6–10', testament: 'Antiguo Testamento' },
  30: { book: 'ÉXODO', subtitle: 'Capítulo 17:10–12', testament: 'Antiguo Testamento' },
  31: { book: 'MOISÉS', subtitle: 'Capítulo 6:34', testament: 'Perla de Gran Precio' },
};

export const SCRIPTURE_PASSAGES: Record<number, ScripturePassage> = {
  1: {
    day: 1,
    reference: 'Josué 1:5–11',
    contextSummary: 'Tras la muerte de Moisés, Jehová llama a Josué a liderar a Israel hacia la tierra prometida, prometiéndole Su compañía constante si permanece fiel y valiente, y Josué manda al pueblo a prepararse para cruzar el Jordán.',
    verses: [
      { verseNumber: 5, text: 'Nadie te podrá hacer frente en todos los días de tu vida; como estuve con Moisés, estaré contigo; no te dejaré ni te desampararé.' },
      { verseNumber: 6, text: 'Esfuérzate y sé valiente, porque tú repartirás a este pueblo por heredad la tierra de la cual juré a sus padres que la daría a ellos.' },
      { verseNumber: 7, text: 'Solamente esfuérzate y sé muy valiente, para cuidar de hacer conforme a toda la ley que mi siervo Moisés te mandó; no te apartes de ella ni a diestra ni a siniestra, para que prosperes en todas las cosas que emprendas.' },
      { verseNumber: 8, text: 'Nunca se apartará de tu boca este libro de la ley, sino que de día y de noche meditarás en él, para que guardes y hagas conforme a todo lo que en él está escrito; porque entonces harás prosperar tu camino y todo te saldrá bien.' },
      { verseNumber: 9, text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo dondequiera que vayas.' },
      { verseNumber: 10, text: 'Y Josué mandó a los oficiales del pueblo, diciendo:' },
      { verseNumber: 11, text: 'Pasad por en medio del campamento y mandad al pueblo, diciendo: Preparaos provisiones, porque dentro de tres días pasaréis este Jordán para entrar a poseer la tierra que Jehová vuestro Dios os da para que la poseáis.' },
    ],
  },
  2: {
    day: 2,
    reference: 'Génesis 45:5–8',
    contextSummary: 'José consuela y perdona a sus hermanos tras darse a conocer ante ellos, testificando que Dios lo envió delante de ellos para preservación de vida y para darles gran liberación.',
    verses: [
      { verseNumber: 5, text: 'Ahora pues, no os entristezcáis ni os pese haberme vendido acá, porque para preservación de vida me envió Dios delante de vosotros.' },
      { verseNumber: 6, text: 'Pues ya ha habido dos años de hambre en medio de la tierra, y aún quedan cinco años en que no habrá arada ni siega.' },
      { verseNumber: 7, text: 'Y Dios me envió delante de vosotros para preservaros posteridad sobre la tierra, y para daros vida por medio de gran liberación.' },
      { verseNumber: 8, text: 'Así pues, no me enviasteis acá vosotros, sino Dios, que me ha puesto por padre de Faraón, y por señor de toda su casa y por gobernador en toda la tierra de Egipto.' },
    ],
  },
  3: {
    day: 3,
    reference: 'Jueces 2:16, 18',
    contextSummary: 'A pesar de las constantes debilidades del pueblo, Jehová en Su infinita compasión levanta jueces que los libren de la opresión de sus enemigos cada vez que claman por socorro.',
    verses: [
      { verseNumber: 16, text: 'Y Jehová levantó jueces que los librasen de mano de los que les despojaban.' },
      { verseNumber: 18, text: 'Y cuando Jehová les levantaba jueces, Jehová estaba con el juez y los libraba de mano de los enemigos todo el tiempo de aquel juez; porque Jehová era movido a misericordia por sus gemidos a causa de los que los oprimían y afligían.' },
    ],
  },
  4: {
    day: 4,
    reference: 'Jueces 4:3–4, 6–8, 14',
    contextSummary: 'Débora, profetisa y jueza en Israel, inspira a Barac a marchar con fe ante las fuerzas opresoras de Sísara, testificando con certidumbre que Jehová va delante de Su pueblo.',
    verses: [
      { verseNumber: 3, text: 'Entonces los hijos de Israel clamaron a Jehová, porque aquel tenía novecientos carros de hierro, y había oprimido con crueldad a los hijos de Israel por veinte años.' },
      { verseNumber: 4, text: 'En aquel tiempo gobernaba a Israel una mujer, Débora, profetisa, mujer de Lapidot;' },
      { verseNumber: 6, text: 'Y ella envió a llamar a Barac hijo de Abinoam, de Cedes de Neftalí, y le dijo: ¿No te ha mandado Jehová Dios de Israel, diciendo: Ve, y junta tu gente en el monte Tabor, y toma contigo diez mil hombres de los hijos de Neftalí y de los hijos de Zabulón;' },
      { verseNumber: 7, text: 'y yo atraeré hacia ti, al arroyo de Cisón, a Sísara, capitán del ejército de Jabín, con sus carros y su multitud, y lo entregaré en tus manos?' },
      { verseNumber: 8, text: 'Y Barac le respondió: Si tú fueres conmigo, yo iré; pero si no fueres conmigo, no iré.' },
      { verseNumber: 14, text: 'Entonces Débora dijo a Barac: Levántate, porque este es el día en que Jehová ha entregado a Sísara en tus manos. ¿No ha salido Jehová delante de ti? Y Barac descendió del monte Tabor, y diez mil hombres en pos de él.' },
    ],
  },
  5: {
    day: 5,
    reference: 'Jueces 6:12–18',
    contextSummary: 'El ángel de Jehová llama al humilde Gedeón asegurándole que el Señor está con él, fortaleciéndolo para librar a Israel y demostrando que con Dios de nuestro lado las mayores pruebas se vencen.',
    verses: [
      { verseNumber: 12, text: 'Y el ángel de Jehová se le apareció y le dijo: Jehová está contigo, varón esforzado y valiente.' },
      { verseNumber: 13, text: 'Y Gedeón le respondió: Ah, Señor mío, si Jehová está con nosotros, ¿por qué nos ha sobrevenido todo esto? ¿Y dónde están todas sus maravillas que nuestros padres nos han contado, diciendo: ¿No nos sacó Jehová de Egipto? Y ahora Jehová nos ha desamparado y nos ha entregado en manos de los madianitas.' },
      { verseNumber: 14, text: 'Y mirándole Jehová, le dijo: Ve con esta tu fuerza, y salvarás a Israel de la mano de los madianitas. ¿No te envío yo?' },
      { verseNumber: 15, text: 'Entonces le respondió: Ah, Señor mío, ¿con qué salvaré yo a Israel? He aquí que mi familia es pobre en Manasés, y yo el menor en la casa de mi padre.' },
      { verseNumber: 16, text: 'Y Jehová le dijo: Ciertamente yo estaré contigo, y derrotarás a los madianitas como a un solo hombre.' },
      { verseNumber: 17, text: 'Y él respondió: Yo te ruego que si he hallado gracia delante de ti, me des una señal de que has hablado conmigo.' },
      { verseNumber: 18, text: 'Te ruego que no te vayas de aquí hasta que yo vuelva a ti, y saque mi ofrenda y la ponga delante de ti. Y él respondió: Yo esperaré hasta que vuelvas.' },
    ],
  },
  6: {
    day: 6,
    reference: 'Rut 1:16–17; 2:2',
    contextSummary: 'Rut expresa su amor y fidelidad incondicional a su suegra Noemí y al Dios de Israel, saliendo con humildad y diligencia a espigar en los campos para bendecir su hogar.',
    verses: [
      { verseNumber: '1:16', text: 'Y Rut respondió: No me ruegues que te deje y me aparte de ti, porque a dondequiera que tú vayas, iré yo, y dondequiera que vivas, viviré. Tu pueblo será mi pueblo, y tu Dios mi Dios.' },
      { verseNumber: '1:17', text: 'Donde tú mueras, moriré yo, y allí seré sepultada; así me haga Jehová, y aun me añada, si no es la muerte lo que haga separación entre nosotras dos.' },
      { verseNumber: '2:2', text: 'Y Rut la moabita dijo a Noemí: Te ruego que me dejes ir al campo a recoger espigas en pos de aquel a cuyos ojos halle gracia. Y ella le dijo: Ve, hija mía.' },
    ],
  },
  7: {
    day: 7,
    reference: '1 Samuel 1:10, 12–13, 17–18',
    contextSummary: 'Ana derrama su alma con profunda sinceridad en el tabernáculo ante Jehová; al recibir la bendición del sacerdote Elí, halla paz y su semblante deja de estar triste.',
    verses: [
      { verseNumber: 10, text: 'Ella, con amargura de alma, oró a Jehová y lloró desconsoladamente.' },
      { verseNumber: 12, text: 'Y aconteció que, mientras ella oraba largamente delante de Jehová, Elí observaba la boca de ella.' },
      { verseNumber: 13, text: 'Pero Ana hablaba en su corazón, y solamente se movían sus labios, y su voz no se oía; y Elí la tuvo por ebria.' },
      { verseNumber: 17, text: 'Y Elí respondió y dijo: Ve en paz, y el Dios de Israel te otorgue la petición que le has hecho.' },
      { verseNumber: 18, text: 'Y ella dijo: Halle tu sierva gracia delante de tus ojos. Y se fue la mujer por su camino, y comió, y no estuvo más triste su semblante.' },
    ],
  },
  8: {
    day: 8,
    reference: 'Rut 2:8–12',
    contextSummary: 'Booz muestra bondad y protección hacia Rut en sus campos de siega, bendiciéndola por haber venido a refugiarse bajo las alas de Jehová.',
    verses: [
      { verseNumber: 8, text: 'Entonces Booz dijo a Rut: Oye, hija mía, no vayas a espigar a otro campo ni pases de aquí; y aquí estarás junto a mis doncellas.' },
      { verseNumber: 9, text: 'Mira bien el campo donde sieguen, y síguelas; porque he mandado a los criados que no te toquen. Y cuando tengas sed, ve a las vasijas y bebe del agua que sacan los criados.' },
      { verseNumber: 10, text: 'Ella entonces, bajando su rostro, se inclinó a tierra y le dijo: ¿Por qué he hallado gracia a tus ojos para que me reconozcas, siendo yo extranjera?' },
      { verseNumber: 11, text: 'Y respondiendo Booz, le dijo: Se me ha declarado en detalle todo lo que has hecho con tu suegra después de la muerte de tu marido, y cómo dejaste a tu padre y a tu madre y la tierra donde naciste, y has venido a un pueblo que no conociste antes.' },
      { verseNumber: 12, text: 'Jehová recompense tu obra, y tu remuneración sea cumplida de parte de Jehová Dios de Israel, bajo cuyas alas has venido a refugiarte.' },
    ],
  },
  9: {
    day: 9,
    reference: '1 Samuel 14:6–8',
    contextSummary: 'Con audaz fe en el poder salvador de Dios, Jonatán y su escudero deciden avanzar con valor, recordando que para Jehová no hay dificultad en salvar con muchos o con pocos.',
    verses: [
      { verseNumber: 6, text: 'Dijo, pues, Jonatán a su escudero: Ven, pasemos a la guarnición de estos incircuncisos; quizá haga algo Jehová por nosotros, pues no es difícil para Jehová salvar con muchos o con pocos.' },
      { verseNumber: 7, text: 'Y su escudero le respondió: Haz todo lo que tienes en tu corazón; ve, pues aquí estoy contigo a tu voluntad.' },
      { verseNumber: 8, text: 'Dijo entonces Jonatán: He aquí, nosotros pasaremos a esos hombres y nos mostraremos a ellos.' },
    ],
  },
  10: {
    day: 10,
    reference: '1 Samuel 16:7, 13',
    contextSummary: 'Jehová enseña a Samuel que Dios no mira la estatura ni las apariencias sino el corazón; Samuel unge al joven David y el Espíritu del Señor reposa sobre él.',
    verses: [
      { verseNumber: 7, text: 'Y Jehová respondió a Samuel: No mires a su parecer ni a lo grande de su estatura, porque yo lo desecho; porque Jehová no mira lo que mira el hombre, pues el hombre mira lo que está delante de sus ojos, pero Jehová mira el corazón.' },
      { verseNumber: 13, text: 'Y Samuel tomó el cuerno del aceite y lo ungió en medio de sus hermanos; y desde aquel día en adelante el Espíritu de Jehová vino sobre David. Y se levantó Samuel y regresó a Ramá.' },
    ],
  },
  11: {
    day: 11,
    reference: '1 Reyes 3:5, 9, 12, 14',
    contextSummary: 'El Señor se aparece a Salomón invitándolo a pedir; el rey pide con humildad sabiduría y discernimiento para guiar con rectitud al pueblo, y Dios lo bendice con entendimiento incomparable.',
    verses: [
      { verseNumber: 5, text: 'Y se le apareció Jehová a Salomón en Gabaón una noche en sueños, y le dijo Dios: Pide lo que quieras que yo te dé.' },
      { verseNumber: 9, text: 'Da, pues, a tu siervo un corazón con entendimiento para juzgar a tu pueblo, para discernir entre lo bueno y lo malo; porque ¿quién podrá gobernar a este tu pueblo tan grande?' },
      { verseNumber: 12, text: 'he aquí, he hecho conforme a tus palabras; he aquí que te he dado un corazón sabio y entendido, tanto que no ha habido antes de ti otro como tú, ni después de ti se levantará otro como tú.' },
      { verseNumber: 14, text: 'Y si anduvieres en mis caminos, guardando mis estatutos y mis mandamientos, como anduvo David tu padre, yo alargaré tus días.' },
    ],
  },
  12: {
    day: 12,
    reference: '1 Reyes 17:1–4',
    contextSummary: 'El profeta Elías declara la sequía y sigue con exactitud la dirección del Señor hacia el arroyo de Querit, donde experimenta el cuidado y sustento providencial de Dios.',
    verses: [
      { verseNumber: 1, text: 'Entonces Elías tisbita, que era de los moradores de Galaad, dijo a Acab: Vive Jehová, Dios de Israel, en cuya presencia estoy, que no habrá lluvia ni rocío en estos años, sino por mi palabra.' },
      { verseNumber: 2, text: 'Y vino a él palabra de Jehová, diciendo:' },
      { verseNumber: 3, text: 'Apártate de aquí, y vuelve al oriente y escóndete en el arroyo de Querit, que está frente al Jordán.' },
      { verseNumber: 4, text: 'Y beberás del arroyo; y yo he mandado a los cuervos que te den allí de comer.' },
    ],
  },
  13: {
    day: 13,
    reference: '2 Reyes 2:1, 8–9',
    contextSummary: 'Antes de que Elías sea arrebatado al cielo en un torbellino, divide las aguas del Jordán con su manto y le ofrece una bendición a Eliseo, quien pide una doble porción de su espíritu.',
    verses: [
      { verseNumber: 1, text: 'Aconteció que, cuando Jehová iba a arrebatar a Elías en un torbellino al cielo, Elías venía con Eliseo de Gilgal.' },
      { verseNumber: 8, text: 'Y tomando Elías su manto, lo dobló y golpeó las aguas, las cuales se apartaron a uno y a otro lado, y pasaron ambos por lo seco.' },
      { verseNumber: 9, text: 'Y aconteció que, cuando hubieron pasado, Elías dijo a Eliseo: Pide lo que quieras que haga por ti, antes que yo sea quitado de ti. Y dijo Eliseo: Te ruego que una doble porción de tu espíritu sea sobre mí.' },
    ],
  },
  14: {
    day: 14,
    reference: '2 Reyes 5:10–11, 13',
    contextSummary: 'Naamán recibe la sencilla instrucción del profeta Eliseo de lavarse siete veces en el Jordán; persuadido por sus siervos con prudencia, aprende el valor de la humildad en las cosas pequeñas.',
    verses: [
      { verseNumber: 10, text: 'Entonces Eliseo le envió un mensajero, diciendo: Ve y lávate siete veces en el Jordán, y tu carne se te restaurará y serás limpio.' },
      { verseNumber: 11, text: 'Y Naamán se fue enojado, diciendo: He aquí yo decía para mí: Saldrá él luego, y estando en pie invocará el nombre de Jehová su Dios, y alzará su mano y tocará el lugar y sanará la lepra.' },
      { verseNumber: 13, text: 'Pero sus criados se acercaron y le hablaron, diciendo: Padre mío, si el profeta te mandara alguna gran cosa, ¿no la harías? ¿Cuánto más, diciéndote: Lávate, y serás limpio?' },
    ],
  },
  15: {
    day: 15,
    reference: '2 Reyes 18:3–7',
    contextSummary: 'El rey Ezequías actúa con rectitud, quita la idolatría y pone toda su esperanza en Jehová; por cuanto se apegó a Dios y guardó Sus mandamientos, el Señor prosperó su camino.',
    verses: [
      { verseNumber: 3, text: 'Hizo lo recto ante los ojos de Jehová, conforme a todas las cosas que había hecho David, su padre.' },
      { verseNumber: 4, text: 'Él quitó los lugares altos, y quebró las imágenes y cortó los símbolos de Asera, e hizo pedazos la serpiente de bronce que había hecho Moisés, porque hasta entonces le quemaban incienso los hijos de Israel; y la llamó Nehustán.' },
      { verseNumber: 5, text: 'En Jehová Dios de Israel puso su esperanza; ni después ni antes de él hubo otro como él entre todos los reyes de Judá.' },
      { verseNumber: 6, text: 'Porque se apegó a Jehová, y no se apartó de él, sino que guardó los mandamientos que Jehová mandó a Moisés.' },
      { verseNumber: 7, text: 'Y Jehová estaba con él; y a dondequiera que salía, prosperaba. Y se rebeló contra el rey de Asiria y no le sirvió.' },
    ],
  },
  16: {
    day: 16,
    reference: '2 Crónicas 34:3',
    contextSummary: 'Siendo aún muy joven, a los ocho años de su reinado, el rey Josías toma la noble decisión de buscar de todo corazón al Dios de David y purificar la tierra de toda iniquidad.',
    verses: [
      { verseNumber: 3, text: 'A los ocho años de su reinado, siendo aún muchacho, comenzó a buscar al Dios de David, su padre; y a los doce años comenzó a limpiar a Judá y a Jerusalén de los lugares altos, y de las imágenes de Asera, y de las esculturas y de las imágenes de fundición.' },
    ],
  },
  17: {
    day: 17,
    reference: 'Génesis 9:8, 11–15',
    contextSummary: 'Dios establece Su pacto sempiterno con Noé y con toda criatura viviente, poniendo el arco iris en las nubes como señal imperecedera de Su fidelidad y misericordia.',
    verses: [
      { verseNumber: 8, text: 'Y habló Dios a Noé y a sus hijos con él, diciendo:' },
      { verseNumber: 11, text: 'Estableceré mi convenio con vosotros, y no morirá ya más toda carne con aguas de diluvio, ni habrá más diluvio para destruir la tierra.' },
      { verseNumber: 12, text: 'Y dijo Dios: Esta es la señal del convenio que yo establezco entre mí y vosotros y todo ser viviente que está con vosotros, por siglos perpetuos:' },
      { verseNumber: 13, text: 'Mi arco he puesto en las nubes, el cual será por señal de convenio entre mí y la tierra.' },
      { verseNumber: 14, text: 'Y sucederá que cuando haga venir nubes sobre la tierra, se dejará ver entonces mi arco en las nubes.' },
      { verseNumber: 15, text: 'Y me acordaré del convenio mío, que hay entre mí y vosotros y todo ser viviente de toda carne; y no habrá más aguas de diluvio para destruir toda carne.' },
    ],
  },
  18: {
    day: 18,
    reference: 'Ester 4:15–16',
    contextSummary: 'La reina Ester convoca a todo su pueblo a tres días de solemne ayuno y oración, y con inmenso valor decide presentarse ante el rey para salvarlos diciendo: «y si perezco, que perezca».',
    verses: [
      { verseNumber: 15, text: 'Y Ester dijo que respondiesen a Mardoqueo:' },
      { verseNumber: 16, text: 'Ve y reúne a todos los judíos que se hallan en Susa, y ayunad por mí, y no comáis ni bebáis en tres días, noche ni día; yo también con mis doncellas ayunaré igualmente, y entonces entraré a ver al rey, aunque no sea conforme a la ley; y si perezco, que perezca.' },
    ],
  },
  19: {
    day: 19,
    reference: 'Ester 4:13–14',
    contextSummary: 'Mardoqueo alienta a Ester a actuar con fe en la providencia del Señor por su pueblo, recordándole con sabiduría: «¿Y quién sabe si para esta hora has llegado al reino?».',
    verses: [
      { verseNumber: 13, text: 'Entonces dijo Mardoqueo que respondiesen a Ester: No pienses en tu alma que escaparás en la casa del rey más que cualquier otro judío.' },
      { verseNumber: 14, text: 'Porque si callas absolutamente en este tiempo, respiro y liberación vendrá de alguna otra parte para los judíos; mas tú y la casa de tu padre pereceréis. ¿Y quién sabe si para esta hora has llegado al reino?' },
    ],
  },
  20: {
    day: 20,
    reference: 'Rut 3:1–5',
    contextSummary: 'Noemí aconseja con prudencia y amor maternal a Rut sobre cómo acercarse a Booz en busca de reposo y redención, y Rut le responde con devoción y obediencia.',
    verses: [
      { verseNumber: 1, text: 'Después le dijo su suegra Noemí: Hija mía, ¿no he de buscar hogar para ti, para que te vaya bien?' },
      { verseNumber: 2, text: '¿No es Booz de nuestra parentela, con cuyas doncellas tú has estado? He aquí que él avienta esta noche la parva de las cebadas.' },
      { verseNumber: 3, text: 'Te lavarás, pues, y te ungirás, y vistiéndote tus mejores vestidos, irás a la era; pero no te darás a conocer al hombre hasta que él haya acabado de comer y de beber.' },
      { verseNumber: 4, text: 'Y cuando él se acueste, notarás el lugar donde se acuesta, e irás y descubrirás sus pies y te acostarás allí; y él te dirá lo que debes hacer.' },
      { verseNumber: 5, text: 'Y ella respondió: Haré todo lo que tú me mandes.' },
    ],
  },
  21: {
    day: 21,
    reference: 'Moisés 1:1–4, 6',
    contextSummary: 'Moisés habla con Dios cara a cara en una alta montaña; el Señor le revela Su omnipotencia y le recuerda su condición divina como hijo a semejanza de Su Unigénito, preparándolo para Su obra.',
    verses: [
      { verseNumber: 1, text: 'Las palabras de Dios que él dijo a Moisés en una ocasión en que Moisés fue arrebatado a una montaña sumamente alta,' },
      { verseNumber: 2, text: 'y vio a Dios cara a cara, y habló con él, y la gloria de Dios estuvo sobre Moisés; por tanto, Moisés pudo permanecer en su presencia.' },
      { verseNumber: 3, text: 'Y Dios habló a Moisés, diciendo: He aquí, soy el Señor Dios Omnipotente, y Sin Fin es mi nombre; porque soy sin principio de días ni fin de años; ¿y no es esto sin fin?' },
      { verseNumber: 4, text: 'Y he aquí, tú eres mi hijo; por tanto, mira, y te mostraré las obras de mis manos; pero no todas, porque mis obras no tienen fin, ni tampoco mis palabras, porque jamás cesan.' },
      { verseNumber: 6, text: 'Y tengo una obra para ti, Moisés, hijo mío; y tú eres a semejanza de mi Unigénito; y mi Unigénito es y será el Salvador, porque él es lleno de gracia y de verdad; pero fuera de mí no hay Dios, y para mí todas las cosas están presentes, porque todas las conozco.' },
    ],
  },
  22: {
    day: 22,
    reference: 'Moisés 7:13',
    contextSummary: 'Tan sublime es la fe de Enoc que, al mandar en el nombre del Señor, las montañas se mueven y los ríos cambian de cauce, demostrando el poder infinito de la palabra de Dios.',
    verses: [
      { verseNumber: 13, text: 'Y tan grande fue la fe de Enoc que condujo al pueblo de Dios, y sus enemigos vinieron a combatir contra ellos; y él habló la palabra del Señor, y tembló la tierra y se movieron las montañas, aun según su mandato; y los ríos de agua se desviaron de su cauce; y se oyó el rugido de los leones en el desierto; y todas las naciones temieron en gran manera, por ser tan poderosa la palabra de Enoc, y tan grande el poder de la palabra que Dios le había dado.' },
    ],
  },
  23: {
    day: 23,
    reference: 'Job 19:23–27',
    contextSummary: 'En medio del mayor sufrimiento físico y espiritual, Job proclama el testimonio eterno e inquebrantable de la resurrección y de su Redentor viviente.',
    verses: [
      { verseNumber: 23, text: '¡Quién diese ahora que mis palabras fuesen escritas! ¡Quién diese que se escribiesen en un libro;' },
      { verseNumber: 24, text: 'que con cincel de hierro y con plomo fuesen esculpidas en piedra para siempre!' },
      { verseNumber: 25, text: 'Yo sé que mi Redentor vive, y que al fin se levantará sobre el polvo;' },
      { verseNumber: 26, text: 'y después de deshecha esta mi piel, aun en mi carne he de ver a Dios;' },
      { verseNumber: 27, text: 'al cual veré por mí mismo, y mis ojos lo verán, y no otro, aunque mi corazón se consume dentro de mí.' },
    ],
  },
  24: {
    day: 24,
    reference: 'Jeremías 31:3',
    contextSummary: 'Jehová consuela a Sus hijos declarando la naturaleza inmutable e inagotable de Su amor divino y la prolongación de Su misericordia.',
    verses: [
      { verseNumber: 3, text: 'Jehová se manifestó a mí hace ya mucho tiempo, diciendo: Con amor eterno te he amado; por tanto, te prolongué mi misericordia.' },
    ],
  },
  25: {
    day: 25,
    reference: 'Génesis 24:14–20',
    contextSummary: 'Rebeca demuestra bondad y diligencia sirviendo con alegría al siervo de Abraham y sacando agua para todos sus camellos, cumpliendo la señal pedida a Dios.',
    verses: [
      { verseNumber: 14, text: 'Sea, pues, que la doncella a quien yo dijere: Baja tu cántaro, te ruego, para que yo beba, y ella respondiere: Bebe, y también daré de beber a tus camellos; que sea esta la que tú has destinado para tu siervo Isaac; y en esto conoceré que has hecho misericordia con mi señor.' },
      { verseNumber: 15, text: 'Y aconteció que, antes que él acabase de hablar, he aquí Rebeca, que había nacido a Betuel... salía con su cántaro sobre su hombro.' },
      { verseNumber: 16, text: 'Y la joven era de muy hermoso aspecto... y descendió a la fuente, y llenó su cántaro y volvía.' },
      { verseNumber: 17, text: 'Entonces el criado corrió hacia ella y dijo: Te ruego que me des a beber un poco de agua de tu cántaro.' },
      { verseNumber: 18, text: 'Y ella dijo: Bebe, señor mío; y se dio prisa a bajar su cántaro sobre su mano, y le dio a beber.' },
      { verseNumber: 19, text: 'Y cuando acabó de darle de beber, dijo: También para tus camellos sacaré agua, hasta que acaben de beber.' },
      { verseNumber: 20, text: 'Y se dio prisa, y vació su cántaro en la pila, y corrió otra vez al pozo para sacar agua, y sacó para todos sus camellos.' },
    ],
  },
  26: {
    day: 26,
    reference: 'Daniel 1:8–12, 19',
    contextSummary: 'Daniel persevera en fidelidad a las leyes de Dios proponiendo en su corazón no contaminarse con los manjares del rey; su obediencia es bendecida con salud, luz y sabiduría superior.',
    verses: [
      { verseNumber: 8, text: 'Y Daniel propuso en su corazón no contaminarse con la porción de la comida del rey ni con el vino que él bebía; pidió, por tanto, al jefe de los eunucos que no se le obligase a contaminarse.' },
      { verseNumber: 9, text: 'Y puso Dios a Daniel en gracia y en buena voluntad con el jefe de los eunucos;' },
      { verseNumber: 10, text: 'y dijo el jefe de los eunucos a Daniel: Temo a mi señor el rey, que señaló vuestra comida y vuestra bebida; pues ¿por qué ha de ver él vuestros rostros más tristes que los de los muchachos que son semejantes a vosotros? Condenaríais así para con el rey mi cabeza.' },
      { verseNumber: 11, text: 'Entonces dijo Daniel al mayordomo que el jefe de los eunucos había puesto sobre Daniel, Ananías, Misael y Azarías:' },
      { verseNumber: 12, text: 'Te ruego que hagas la prueba con tus siervos durante diez días, y nos den legumbres a comer y agua a beber.' },
      { verseNumber: 19, text: 'Y el rey habló con ellos, y no fueron hallados entre todos ellos otros como Daniel, Ananías, Misael y Azarías; y así, permanecieron al servicio del rey.' },
    ],
  },
  27: {
    day: 27,
    reference: 'Éxodo 18:14–15, 17–19',
    contextSummary: 'Jetro observa el agotamiento de Moisés juzgando solo al pueblo y le brinda sabio consejo para delegar responsabilidades en líderes temerosos de Dios y compartir la carga.',
    verses: [
      { verseNumber: 14, text: 'Viendo el suegro de Moisés todo lo que él hacía con el pueblo, dijo: ¿Qué es esto que haces tú con el pueblo? ¿Por qué te sientas tú solo, y todo el pueblo está delante de ti desde la mañana hasta la tarde?' },
      { verseNumber: 15, text: 'Y Moisés respondió a su suegro: Porque el pueblo viene a mí para consultar a Dios.' },
      { verseNumber: 17, text: 'Entonces el suegro de Moisés le dijo: No está bien lo que haces.' },
      { verseNumber: 18, text: 'Desfallecerás del todo, tú y también este pueblo que está contigo, porque el trabajo es demasiado pesado para ti; no podrás hacerlo tú solo.' },
      { verseNumber: 19, text: 'Oye ahora mi voz; yo te aconsejaré, y Dios estará contigo. Sé tú el representante del pueblo ante Dios, y somete tú los asuntos a Dios.' },
    ],
  },
  28: {
    day: 28,
    reference: '2 Reyes 5:13, 14–15',
    contextSummary: 'Naamán escucha el consejo humilde de sus siervos, se sumerge siete veces en el Jordán y es enteramente sanado, testificando que no hay Dios en toda la tierra sino en Israel.',
    verses: [
      { verseNumber: 13, text: 'Pero sus criados se acercaron y le hablaron, diciendo: Padre mío, si el profeta te mandara alguna gran cosa, ¿no la harías? ¿Cuánto más, diciéndote: Lávate, y serás limpio?' },
      { verseNumber: 14, text: 'Él entonces descendió y se zambulló siete veces en el Jordán, conforme a la palabra del varón de Dios; y su carne se volvió como la carne de un niño, y quedó limpio.' },
      { verseNumber: 15, text: 'Y regresó al varón de Dios, él y toda su compañía, y se puso delante de él y dijo: He aquí, ahora reconozco que no hay Dios en toda la tierra, sino en Israel. Te ruego que recibas un presente de tu siervo.' },
    ],
  },
  29: {
    day: 29,
    reference: '1 Samuel 3:6–10',
    contextSummary: 'El joven Samuel escucha la voz de Jehová en el santuario y, guiado por Elí para reconocer la voz divina, responde con devoción: «Habla, porque tu siervo oye».',
    verses: [
      { verseNumber: 6, text: 'Y Jehová volvió a llamar otra vez: ¡Samuel! Y levantándose Samuel, vino a Elí y dijo: Heme aquí; ¿para qué me has llamado? Y él dijo: Hijo mío, yo no he llamado; vuelve a acostarte.' },
      { verseNumber: 7, text: 'Y Samuel no conocía aún a Jehová, ni la palabra de Jehová le había sido aún revelada.' },
      { verseNumber: 8, text: 'Jehová, pues, llamó la tercera vez a Samuel. Y él se levantó y vino a Elí y dijo: Heme aquí; ¿para qué me has llamado? Entonces entendió Elí que Jehová llamaba al joven.' },
      { verseNumber: 9, text: 'Y dijo Elí a Samuel: Ve y acuéstate; y si te llama, dirás: Habla, Jehová, porque tu siervo oye. Así se fue Samuel y se acostó en su lugar.' },
      { verseNumber: 10, text: 'Y vino Jehová, y se puso allí y llamó como las otras veces: ¡Samuel, Samuel! Entonces Samuel dijo: Habla, porque tu siervo oye.' },
    ],
  },
  30: {
    day: 30,
    reference: 'Éxodo 17:10–12',
    contextSummary: 'Aarón y Hur sostienen con firmeza las manos cansadas del profeta Moisés en la cima del collado, permitiendo que el pueblo prevalezca con la bendición del Señor.',
    verses: [
      { verseNumber: 10, text: 'E hizo Josué como le dijo Moisés, peleando contra Amalec; y Moisés, y Aarón y Hur subieron a la cumbre del collado.' },
      { verseNumber: 11, text: 'Y acontecía que, cuando alzaba Moisés su mano, Israel prevalecía; mas cuando él bajaba su mano, prevalecía Amalec.' },
      { verseNumber: 12, text: 'Y las manos de Moisés se cansaban; por lo que tomaron una piedra y la pusieron debajo de él, y se sentó sobre ella; y Aarón y Hur sostenían sus manos, el uno de un lado y el otro del otro; así hubo en sus manos firmeza hasta que se puso el sol.' },
    ],
  },
  31: {
    day: 31,
    reference: 'Moisés 6:34',
    contextSummary: 'El testimonio culminante del desafío: la promesa del Señor a Enoc de comunión constante, poder espiritual y compañía de Su Santo Espíritu para caminar juntos por siempre.',
    verses: [
      { verseNumber: 34, text: 'He aquí, mi Espíritu está sobre ti; por tanto, justificaré todas tus palabras; y las montañas huirán delante de ti, y los ríos se desviarán de su cauce; y tú permanecerás en mí, y yo en ti; camina, pues, conmigo.' },
    ],
  },
};
