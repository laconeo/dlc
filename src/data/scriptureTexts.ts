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
  1: { book: 'JOSUÉ', subtitle: 'Capítulo 1:5–9', testament: 'Antiguo Testamento' },
  2: { book: 'GÉNESIS', subtitle: 'Capítulo 39:2–3 · Capítulo 45:4–5', testament: 'Antiguo Testamento' },
  3: { book: 'LEVÍTICO', subtitle: 'Capítulo 19:18, 34', testament: 'Antiguo Testamento' },
  4: { book: 'JUECES', subtitle: 'Capítulo 4:4–9, 14', testament: 'Antiguo Testamento' },
  5: { book: 'JUECES', subtitle: 'Capítulo 6:12–16 · Capítulo 7:7', testament: 'Antiguo Testamento' },
  6: { book: 'RUT', subtitle: 'Capítulo 1:16–17', testament: 'Antiguo Testamento' },
  7: { book: '1 SAMUEL', subtitle: 'Capítulo 1:10–13, 27–28', testament: 'Antiguo Testamento' },
  8: { book: 'RUT', subtitle: 'Capítulo 2:8–12', testament: 'Antiguo Testamento' },
  9: { book: '1 SAMUEL', subtitle: 'Capítulo 18:1–4 · Capítulo 20:17', testament: 'Antiguo Testamento' },
  10: { book: '1 SAMUEL & SALMOS', subtitle: '1 Samuel 17:45–47 · Salmo 23:1', testament: 'Antiguo Testamento' },
  11: { book: '1 REYES', subtitle: 'Capítulo 3:7–12', testament: 'Antiguo Testamento' },
  12: { book: '1 REYES', subtitle: 'Capítulo 19:11–13', testament: 'Antiguo Testamento' },
  13: { book: '2 REYES', subtitle: 'Capítulo 4:1–7 · Capítulo 6:15–17', testament: 'Antiguo Testamento' },
  14: { book: '2 REYES', subtitle: 'Capítulo 5:9–14', testament: 'Antiguo Testamento' },
  15: { book: '2 REYES', subtitle: 'Capítulo 18:5–7 · Capítulo 19:14–19', testament: 'Antiguo Testamento' },
  16: { book: '2 REYES', subtitle: 'Capítulo 22:8–13 · Capítulo 23:25', testament: 'Antiguo Testamento' },
  17: { book: 'GÉNESIS', subtitle: 'Capítulo 6:8–9, 22', testament: 'Antiguo Testamento' },
  18: { book: 'ESTER', subtitle: 'Capítulo 4:14–16', testament: 'Antiguo Testamento' },
  19: { book: 'ESTER', subtitle: 'Capítulo 2:7, 21–23 · Capítulo 3:2', testament: 'Antiguo Testamento' },
  20: { book: 'RUT', subtitle: 'Capítulo 1:19–21 · Capítulo 4:14–17', testament: 'Antiguo Testamento' },
  21: { book: 'ÉXODO', subtitle: 'Capítulo 3:11–14 · Capítulo 14:13–14', testament: 'Antiguo Testamento' },
  22: { book: 'MOISÉS & GÉNESIS', subtitle: 'Moisés 7:18, 69 · Génesis 5:24', testament: 'Perla de Gran Precio' },
  23: { book: 'JOB', subtitle: 'Capítulo 19:25–26', testament: 'Antiguo Testamento' },
  24: { book: 'JEREMÍAS', subtitle: 'Capítulo 1:5 · Capítulo 31:33', testament: 'Antiguo Testamento' },
  25: { book: 'GÉNESIS', subtitle: 'Capítulo 24:15–20', testament: 'Antiguo Testamento' },
  26: { book: 'DANIEL', subtitle: 'Capítulo 1:8 · Capítulo 6:10, 20–22', testament: 'Antiguo Testamento' },
  27: { book: 'ÉXODO', subtitle: 'Capítulo 18:17–24', testament: 'Antiguo Testamento' },
  28: { book: '2 REYES', subtitle: 'Capítulo 5:2–4', testament: 'Antiguo Testamento' },
  29: { book: '1 SAMUEL', subtitle: 'Capítulo 3:8–10', testament: 'Antiguo Testamento' },
  30: { book: 'ÉXODO', subtitle: 'Capítulo 17:10–13', testament: 'Antiguo Testamento' },
  31: { book: 'TESTIMONIO DE CRISTO', subtitle: 'Juan 14:6 · Isaías 53:3–5 · 2 Nefi 25:26', testament: 'Escrituras Sagradas' },
};

export const SCRIPTURE_PASSAGES: Record<number, ScripturePassage> = {
  1: {
    day: 1,
    reference: 'Josué 1:5–9',
    contextSummary: 'Tras la muerte de Moisés, Jehová llama a Josué a liderar a Israel hacia la tierra prometida, prometiéndole Su compañía constante si permanece fiel y valiente.',
    verses: [
      { verseNumber: 5, text: 'Nadie te podrá hacer frente en todos los días de tu vida; como estuve con Moisés, estaré contigo; no te dejaré ni te desampararé.' },
      { verseNumber: 6, text: 'Esfuérzate y sé valiente, porque tú repartirás a este pueblo por heredad la tierra de la cual juré a sus padres que la daría a ellos.' },
      { verseNumber: 7, text: 'Solamente esfuérzate y sé muy valiente, para cuidar de hacer conforme a toda la ley que mi siervo Moisés te mandó; no te apartes de ella ni a diestra ni a siniestra, para que prosperes en todas las cosas que emprendas.' },
      { verseNumber: 8, text: 'Nunca se apartará de tu boca este libro de la ley, sino que de día y de noche meditarás en él, para que guardes y hagas conforme a todo lo que en él está escrito; porque entonces harás prosperar tu camino y todo te saldrá bien.' },
      { verseNumber: 9, text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo dondequiera que vayas.' },
    ],
  },
  2: {
    day: 2,
    reference: 'Génesis 39:2–3; 45:4–5',
    contextSummary: 'José en Egipto es bendecido por su rectitud en la casa de Potifar, y años después perdona con amor redentor a sus hermanos reconociendo la mano providencial de Dios.',
    verses: [
      { verseNumber: '39:2', text: 'Mas Jehová estaba con José, y fue varón próspero; y estaba en la casa de su amo el egipcio.' },
      { verseNumber: '39:3', text: 'Y vio su amo que Jehová estaba con él, y que todo lo que él hacía, Jehová lo hacía prosperar en su mano.' },
      { verseNumber: '45:4', text: 'Entonces dijo José a sus hermanos: Acercaos ahora a mí. Y ellos se acercaron. Y él dijo: Yo soy José, vuestro hermano, el que vendisteis para Egipto.' },
      { verseNumber: '45:5', text: 'Ahora pues, no os entristezcáis ni os pese haberme vendido acá, porque para preservación de vida me envió Dios delante de vosotros.' },
    ],
  },
  3: {
    day: 3,
    reference: 'Levítico 19:18, 34',
    contextSummary: 'La ley de santidad dada a Israel enseña el principio supremo del amor al prójimo y la compasión hacia el extranjero.',
    verses: [
      { verseNumber: 18, text: 'No te vengarás ni guardarás rencor a los hijos de tu pueblo, sino que amarás a tu prójimo como a ti mismo. Yo, Jehová.' },
      { verseNumber: 34, text: 'Como a uno de vosotros trataréis al extranjero que more entre vosotros, y lo amarás como a ti mismo, porque extranjeros fuisteis en la tierra de Egipto. Yo, Jehová vuestro Dios.' },
    ],
  },
  4: {
    day: 4,
    reference: 'Jueces 4:4–9, 14',
    contextSummary: 'Débora, profetisa y jueza en Israel, inspira a Barac a liderar con fe ante el opresor Sísara, testificando que Jehová va delante de Su pueblo.',
    verses: [
      { verseNumber: 4, text: 'En aquel tiempo gobernaba a Israel una mujer, Débora, profetisa, mujer de Lapidot;' },
      { verseNumber: 5, text: 'y acostumbraba sentarse bajo la palmera de Débora, entre Ramá y Bet-el, en el monte de Efraín; y los hijos de Israel subían a ella a juicio.' },
      { verseNumber: 6, text: 'Y ella envió a llamar a Barac hijo de Abinoam, de Cedes de Neftalí, y le dijo: ¿No te ha mandado Jehová Dios de Israel, diciendo: Ve, y junta tu gente en el monte Tabor, y toma contigo diez mil hombres de los hijos de Neftalí y de los hijos de Zabulón;' },
      { verseNumber: 7, text: 'y yo atraeré hacia ti, al arroyo de Cisón, a Sísara, capitán del ejército de Jabín, con sus carros y su multitud, y lo entregaré en tus manos?' },
      { verseNumber: 8, text: 'Y Barac le respondió: Si tú fueres conmigo, yo iré; pero si no fueres conmigo, no iré.' },
      { verseNumber: 9, text: 'Y ella dijo: Iré contigo; mas no será tuya la gloria de la jornada que emprendes, porque en mano de mujer venderá Jehová a Sísara. Y levantándose Débora, fue con Barac a Cedes.' },
      { verseNumber: 14, text: 'Entonces Débora dijo a Barac: Levántate, porque este es el día en que Jehová ha entregado a Sísara en tus manos. ¿No ha salido Jehová delante de ti? Y Barac descendió del monte Tabor, y diez mil hombres en pos de él.' },
    ],
  },
  5: {
    day: 5,
    reference: 'Jueces 6:12–16; 7:7',
    contextSummary: 'El ángel de Jehová llama al humilde Gedeón para librar a Israel, demostrando que con pocos y con la fuerza del Señor se logran grandes victorias.',
    verses: [
      { verseNumber: '6:12', text: 'Y el ángel de Jehová se le apareció y le dijo: Jehová está contigo, varón esforzado y valiente.' },
      { verseNumber: '6:13', text: 'Y Gedeón le respondió: Ah, Señor mío, si Jehová está con nosotros, ¿por qué nos ha sobrevenido todo esto? ¿Y dónde están todas sus maravillas que nuestros padres nos han contado, diciendo: ¿No nos sacó Jehová de Egipto? Y ahora Jehová nos ha desamparado y nos ha entregado en manos de los madianitas.' },
      { verseNumber: '6:14', text: 'Y mirándole Jehová, le dijo: Ve con esta tu fuerza, y salvarás a Israel de la mano de los madianitas. ¿No te envío yo?' },
      { verseNumber: '6:15', text: 'Entonces le respondió: Ah, Señor mío, ¿con qué salvaré yo a Israel? He aquí que mi familia es pobre en Manasés, y yo el menor en la casa de mi padre.' },
      { verseNumber: '6:16', text: 'Y Jehová le dijo: Ciertamente yo estaré contigo, y derrotarás a los madianitas como a un solo hombre.' },
      { verseNumber: '7:7', text: 'Entonces Jehová dijo a Gedeón: Con estos trescientos hombres que lamieron el agua os salvaré y entregaré a los madianitas en tus manos; y váyase toda la demás gente, cada uno a su lugar.' },
    ],
  },
  6: {
    day: 6,
    reference: 'Rut 1:16–17',
    contextSummary: 'Rut expresa su amor y fidelidad incondicional a su suegra Noemí y al Dios de Israel, dejando atrás su tierra natal.',
    verses: [
      { verseNumber: 16, text: 'Y Rut respondió: No me ruegues que te deje y me aparte de ti, porque a dondequiera que tú vayas, iré yo, y dondequiera que vivas, viviré. Tu pueblo será mi pueblo, y tu Dios mi Dios.' },
      { verseNumber: 17, text: 'Donde tú mueras, moriré yo, y allí seré sepultada; así me haga Jehová, y aun me añada, si no es la muerte lo que haga separación entre nosotras dos.' },
    ],
  },
  7: {
    day: 7,
    reference: '1 Samuel 1:10–13, 27–28',
    contextSummary: 'Ana derrama su alma en ferviente oración en el tabernáculo pidiendo un hijo, y al ser bendecida con Samuel, lo consagra al servicio de Jehová con gratitud.',
    verses: [
      { verseNumber: 10, text: 'Ella, con amargura de alma, oró a Jehová y lloró desconsoladamente.' },
      { verseNumber: 11, text: 'E hizo voto, diciendo: Jehová de los ejércitos, si te dignares mirar la aflicción de tu sierva, y te acordares de mí y no te olvidares de tu sierva, sino que dieres a tu sierva un hijo varón, yo lo dedicaré a Jehová todos los días de su vida, y no pasará navaja por su cabeza.' },
      { verseNumber: 12, text: 'Y aconteció que, mientras ella oraba largamente delante de Jehová, Elí observaba la boca de ella.' },
      { verseNumber: 13, text: 'Pero Ana hablaba en su corazón, y solamente se movían sus labios, y su voz no se oía; y Elí la tuvo por ebria.' },
      { verseNumber: 27, text: 'Por este niño oraba, y Jehová me dio lo que le pedí.' },
      { verseNumber: 28, text: 'Yo, pues, lo dedico también a Jehová; todos los días que viva, será de Jehová. Y adoró allí a Jehová.' },
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
    reference: '1 Samuel 18:1–4; 20:17',
    contextSummary: 'La amistad pura entre Jonatán y David ejemplifica el amor fraternal desinteresado y la lealtad según el corazón de Dios.',
    verses: [
      { verseNumber: '18:1', text: 'Y aconteció que, cuando él hubo acabado de hablar con Saúl, el alma de Jonatán quedó ligada con la de David, y lo amó Jonatán como a su propia alma.' },
      { verseNumber: '18:2', text: 'Y Saúl le tomó aquel día y no le dejó volver a casa de su padre.' },
      { verseNumber: '18:3', text: 'E hicieron pacto Jonatán y David, porque él le amaba como a su propia alma.' },
      { verseNumber: '18:4', text: 'Y Jonatán se quitó el manto que llevaba y se lo dio a David, y otras ropas suyas, hasta su espada, y su arco y su talabarte.' },
      { verseNumber: '20:17', text: 'Y Jonatán hizo jurar a David otra vez, porque le amaba, pues le amaba como a su propia alma.' },
    ],
  },
  10: {
    day: 10,
    reference: '1 Samuel 17:45–47; Salmos 23:1',
    contextSummary: 'El joven pastor David enfrenta al gigante Goliat en el nombre de Jehová de los ejércitos, confiando en que de Dios es la batalla.',
    verses: [
      { verseNumber: '17:45', text: 'Entonces dijo David al filisteo: Tú vienes a mí con espada, y lanza y jabalina; mas yo vengo a ti en el nombre de Jehová de los ejércitos, el Dios de los escuadrones de Israel, a quien tú has desafiado.' },
      { verseNumber: '17:46', text: 'Jehová te entregará hoy en mi mano, y yo te venceré y te cortaré la cabeza, y daré hoy los cuerpos de los filisteos a las aves del cielo y a las bestias de la tierra; y toda la tierra sabrá que hay Dios en Israel.' },
      { verseNumber: '17:47', text: 'Y sabrá toda esta congregación que Jehová no salva con espada ni con lanza, porque de Jehová es la batalla, y él os entregará en nuestras manos.' },
      { verseNumber: 'Salmos 23:1', text: 'Jehová es mi pastor; nada me faltará.' },
    ],
  },
  11: {
    day: 11,
    reference: '1 Reyes 3:7–12',
    contextSummary: 'Al comenzar su reinado, Salomón pide humildemente a Jehová un corazón sabio y con entendimiento para gobernar al pueblo con rectitud.',
    verses: [
      { verseNumber: 7, text: 'Ahora pues, Jehová Dios mío, tú has puesto a mí, tu siervo, por rey en lugar de David, mi padre; y yo soy un joven y no sé cómo entrar ni salir.' },
      { verseNumber: 8, text: 'Y tu siervo está en medio de tu pueblo que tú escogiste; un pueblo grande, que no se puede contar ni numerar por su multitud.' },
      { verseNumber: 9, text: 'Da, pues, a tu siervo un corazón con entendimiento para juzgar a tu pueblo, para discernir entre lo bueno y lo malo; porque ¿quién podrá gobernar a este tu pueblo tan grande?' },
      { verseNumber: 10, text: 'Y agradó al Señor que Salomón pidiese esto.' },
      { verseNumber: 11, text: 'Y le dijo Dios: Porque has pedido esto, y no pediste para ti largos días, ni pediste para ti riquezas, ni pediste la vida de tus enemigos, sino que pediste para ti entendimiento para discernir juicio,' },
      { verseNumber: 12, text: 'he aquí, he hecho conforme a tus palabras; he aquí que te he dado un corazón sabio y entendido, tanto que no ha habido antes de ti otro como tú, ni después de ti se levantará otro como tú.' },
    ],
  },
  12: {
    day: 12,
    reference: '1 Reyes 19:11–13',
    contextSummary: 'En el monte Horeb, el profeta Elías aprende que el Señor no se manifiesta en el viento tempestuoso ni en el terremoto, sino en la voz quieta y apacible del Espíritu.',
    verses: [
      { verseNumber: 11, text: 'Y él le dijo: Sal fuera y ponte en el monte delante de Jehová. Y he aquí que Jehová pasaba, y un grande y poderoso viento rompía los montes y quebraba las peñas delante de Jehová; pero Jehová no estaba en el viento. Y tras el viento, un terremoto; pero Jehová no estaba en el terremoto.' },
      { verseNumber: 12, text: 'Y tras el terremoto, un fuego; pero Jehová no estaba en el fuego. Y tras el fuego, un silbo apacible y delicado.' },
      { verseNumber: 13, text: 'Y aconteció que al oírlo Elías, cubrió su rostro con su manto, y salió y se puso a la entrada de la cueva. Y he aquí vino a él una voz, diciendo: ¿Qué haces aquí, Elías?' },
    ],
  },
  13: {
    day: 13,
    reference: '2 Reyes 4:1–7; 6:15–17',
    contextSummary: 'Eliseo multiplica el aceite de la viuda necesitada y reconforta a su siervo abriendo sus ojos espirituales para ver los ejércitos celestiales.',
    verses: [
      { verseNumber: '4:2', text: 'Y Eliseo le dijo: ¿Qué te haré yo? Declárame qué tienes en casa. Y ella dijo: Tu sierva ninguna cosa tiene en casa, sino una vasija de aceite.' },
      { verseNumber: '4:3', text: 'Y él le dijo: Ve y pide para ti vasijas prestadas de todos tus vecinos, vasijas vacías, no pocas.' },
      { verseNumber: '4:6', text: 'Y aconteció que, cuando las vasijas estuvieron llenas, dijo a su hijo: Tráeme aún otra vasija. Y él dijo: No hay más vasijas. Entonces cesó el aceite.' },
      { verseNumber: '6:15', text: 'Y levantándose de mañana el que servía al varón de Dios para salir, he aquí el ejército que sitiaba la ciudad, con caballos y carros. Entonces su criado le dijo: ¡Ah, señor mío! ¿qué haremos?' },
      { verseNumber: '6:16', text: 'Y él dijo: No tengas miedo, porque más son los que están con nosotros que los que están con ellos.' },
      { verseNumber: '6:17', text: 'Y oró Eliseo y dijo: Te ruego, oh Jehová, que abras sus ojos para que vea. Entonces Jehová abrió los ojos del joven, y miró; y he aquí que el monte estaba lleno de caballos y de carros de fuego alrededor de Eliseo.' },
    ],
  },
  14: {
    day: 14,
    reference: '2 Reyes 5:9–14',
    contextSummary: 'Naamán, capitán del ejército de Siria, aprende el valor de la humildad al obedecer el mandato sencillo del profeta y lavarse siete veces en el río Jordán.',
    verses: [
      { verseNumber: 9, text: 'Y vino Naamán con sus caballos y con sus carros, y se paró a las puertas de la casa de Eliseo.' },
      { verseNumber: 10, text: 'Entonces Eliseo le envió un mensajero, diciendo: Ve y lávate siete veces en el Jordán, y tu carne se te restaurará y serás limpio.' },
      { verseNumber: 11, text: 'Y Naamán se fue enojado, diciendo: He aquí yo decía para mí: Saldrá él luego, y estando en pie invocará el nombre de Jehová su Dios, y alzará su mano y tocará el lugar y sanará la lepra.' },
      { verseNumber: 13, text: 'Pero sus criados se acercaron y le hablaron, diciendo: Padre mío, si el profeta te mandara alguna gran cosa, ¿no la harías? ¿Cuánto más, diciéndote: Lávate, y serás limpio?' },
      { verseNumber: 14, text: 'Él entonces descendió y se zambulló siete veces en el Jordán, conforme a la palabra del varón de Dios; y su carne se volvió como la carne de un niño, y quedó limpio.' },
    ],
  },
  15: {
    day: 15,
    reference: '2 Reyes 18:5–7; 19:14–19',
    contextSummary: 'El rey Ezequías confía plenamente en Jehová ante la amenaza del ejército asirio y extiende sus oraciones en el templo buscando la salvación divina.',
    verses: [
      { verseNumber: '18:5', text: 'En Jehová Dios de Israel puso su esperanza; ni después ni antes de él hubo otro como él entre todos los reyes de Judá.' },
      { verseNumber: '18:6', text: 'Porque se apegó a Jehová, y no se apartó de él, sino que guardó los mandamientos que Jehová mandó a Moisés.' },
      { verseNumber: '18:7', text: 'Y Jehová estaba con él; y a dondequiera que salía, prosperaba.' },
      { verseNumber: '19:14', text: 'Y tomó Ezequías las cartas de mano de los mensajeros, y las leyó; y subió a la casa de Jehová y las extendió Ezequías delante de Jehová.' },
      { verseNumber: '19:19', text: 'Ahora pues, oh Jehová Dios nuestro, sálvanos, te ruego, de su mano, para que sepan todos los reinos de la tierra que solo tú, Jehová, eres Dios.' },
    ],
  },
  16: {
    day: 16,
    reference: '2 Reyes 22:8–13; 23:25',
    contextSummary: 'El joven rey Josías redescubre el libro de la ley en el templo y renueva el convenio con todo su corazón para guiar al pueblo a Jehová.',
    verses: [
      { verseNumber: '22:8', text: 'Entonces dijo el sumo sacerdote Hilcías a Safán escriba: He hallado el libro de la ley en la casa de Jehová. E Hilcías dio el libro a Safán, y lo leyó.' },
      { verseNumber: '22:11', text: 'Y aconteció que, cuando el rey hubo oído las palabras del libro de la ley, rasgó sus vestidos.' },
      { verseNumber: '22:13', text: 'Id y consultad a Jehová por mí, y por el pueblo y por todo Judá, acerca de las palabras de este libro que se ha hallado; porque grande es la ira de Jehová que se ha encendido contra nosotros.' },
      { verseNumber: '23:25', text: 'No hubo otro rey antes de él que se convirtiese a Jehová con todo su corazón, y con toda su alma y con todas sus fuerzas, conforme a toda la ley de Moisés; ni después de él nació otro tal.' },
    ],
  },
  17: {
    day: 17,
    reference: 'Génesis 6:8–9, 22',
    contextSummary: 'En medio de un mundo corrompido, Noé halla gracia ante Jehová por su rectitud, caminando con Dios y obedeciendo fielmente Sus mandatos.',
    verses: [
      { verseNumber: 8, text: 'Pero Noé halló gracia ante los ojos de Jehová.' },
      { verseNumber: 9, text: 'Estas son las generaciones de Noé: Noé, varón justo, era perfecto en sus generaciones; con Dios caminó Noé.' },
      { verseNumber: 22, text: 'E hizo Noé conforme a todo lo que Dios le mandó; así lo hizo.' },
    ],
  },
  18: {
    day: 18,
    reference: 'Ester 4:14–16',
    contextSummary: 'La reina Ester acepta con valentía la misión de interceder por su pueblo ante el rey, convocando a todos al ayuno y consagrándose enteramente.',
    verses: [
      { verseNumber: 14, text: 'Porque si callas absolutamente en este tiempo, respiro y liberación vendrá de alguna otra parte para los judíos; mas tú y la casa de tu padre pereceréis. ¿Y quién sabe si para esta hora has llegado al reino?' },
      { verseNumber: 15, text: 'Y Ester dijo que respondiesen a Mardoqueo:' },
      { verseNumber: 16, text: 'Ve y reúne a todos los judíos que se hallan en Susa, y ayunad por mí, y no comáis ni bebáis en tres días, noche ni día; yo también con mis doncellas ayunaré igualmente, y entonces entraré a ver al rey, aunque no sea conforme a la ley; y si perezco, que perezca.' },
    ],
  },
  19: {
    day: 19,
    reference: 'Ester 2:7, 21–23; 3:2',
    contextSummary: 'Mardoqueo cría a Ester con sabiduría, protege al rey alertando de una conspiración y se mantiene inquebrantable en su adoración solo a Dios.',
    verses: [
      { verseNumber: '2:7', text: 'Y había criado a Hadasa, es decir, Ester, hija de su tío, porque no tenía padre ni madre; y la joven era de hermosa figura y de buen parecer. Y cuando su padre y su madre murieron, Mardoqueo la tomó como hija suya.' },
      { verseNumber: '2:21', text: 'En aquellos días, estando Mardoqueo sentado a la puerta del rey, se enojaron Bigtán y Teres, dos eunucos del rey de la guardia de la puerta, y procuraban poner mano en el rey Asuero.' },
      { verseNumber: '2:22', text: 'Mas cuando esto llegó a conocimiento de Mardoqueo, él lo denunció a la reina Ester, y Ester lo dijo al rey en nombre de Mardoqueo.' },
      { verseNumber: '3:2', text: 'Y todos los siervos del rey que estaban a la puerta del rey se arrodillaban e inclinaban ante Amán, porque así lo había mandado el rey; pero Mardoqueo ni se arrodillaba ni se humillaba.' },
    ],
  },
  20: {
    day: 20,
    reference: 'Rut 1:19–21; 4:14–17',
    contextSummary: 'Noemí regresa afligida a Belén, pero con la lealtad de Rut experimenta la maravillosa restauración del Señor que llena de gozo su vejez.',
    verses: [
      { verseNumber: '1:19', text: 'Anduvieron, pues, ellas dos hasta que llegaron a Belén; y aconteció que, habiendo entrado en Belén, toda la ciudad se conmovió por causa de ellas, y decían: ¿No es esta Noemí?' },
      { verseNumber: '1:20', text: 'Y ella les respondía: No me llaméis Noemí, sino llamadme Mara, porque en grande amargura me ha puesto el Todopoderoso.' },
      { verseNumber: '4:14', text: 'Y las mujeres decían a Noemí: Alabado sea Jehová, que hizo que no te faltase hoy pariente, cuyo nombre sea celebrado en Israel;' },
      { verseNumber: '4:15', text: 'el cual será restaurador de tu alma, y te sustentará en tu vejez; pues tu nuera, que te ama, lo ha dado a luz; y ella es de más valor para ti que siete hijos.' },
      { verseNumber: '4:17', text: 'Y le dieron nombre las vecinas, diciendo: ¡Le ha nacido un hijo a Noemí! Y le llamaron Obed. Este es padre de Isaí, padre de David.' },
    ],
  },
  21: {
    day: 21,
    reference: 'Éxodo 3:11–14; 14:13–14',
    contextSummary: 'Jehová llama a Moisés desde la zarza ardiente y promete estar con él para liberar a Israel, manifestando Su gloria en el mar Rojo.',
    verses: [
      { verseNumber: '3:11', text: 'Entonces Moisés respondió a Dios: ¿Quién soy yo para que vaya a Faraón y saque de Egipto a los hijos de Israel?' },
      { verseNumber: '3:12', text: 'Y él respondió: Ve, porque yo estaré contigo; y esto te será por señal de que yo te he enviado: cuando hayas sacado de Egipto al pueblo, serviréis a Dios sobre este monte.' },
      { verseNumber: '3:14', text: 'Y respondió Dios a Moisés: YO SOY EL QUE SOY. Y dijo: Así dirás a los hijos de Israel: YO SOY me ha enviado a vosotros.' },
      { verseNumber: '14:13', text: 'Y Moisés dijo al pueblo: No temáis; estad firmes y ved la salvación que Jehová hará hoy con vosotros; porque los egipcios que hoy habéis visto, nunca más para siempre los veréis.' },
      { verseNumber: '14:14', text: 'Jehová peleará por vosotros, y vosotros estaréis tranquilos.' },
    ],
  },
  22: {
    day: 22,
    reference: 'Moisés 7:18, 69 (Génesis 5:24)',
    contextSummary: 'Enoc camina con Dios y edifica la ciudad de Sion, donde el pueblo alcanza la plenitud al ser de un solo corazón y una sola mente.',
    verses: [
      { verseNumber: 'Moisés 7:18', text: 'Y el Señor llamó SION a su pueblo, porque eran uno en corazón y mente, y vivían en rectitud; y no había pobres entre ellos.' },
      { verseNumber: 'Moisés 7:69', text: 'Y aconteció que Sion, en el transcurso del tiempo, fue llevada al cielo. Y el Señor dijo a Enoc: He aquí mi morada para siempre.' },
      { verseNumber: 'Génesis 5:24', text: 'Caminó, pues, Enoc con Dios, y desapareció, porque le llevó Dios.' },
    ],
  },
  23: {
    day: 23,
    reference: 'Job 19:25–26',
    contextSummary: 'En medio del sufrimiento y las pruebas más intensas, Job proclama el testimonio eterno e inquebrantable de la resurrección y de su Redentor.',
    verses: [
      { verseNumber: 25, text: 'Yo sé que mi Redentor vive, y que al fin se levantará sobre el polvo;' },
      { verseNumber: 26, text: 'y después de deshecha esta mi piel, aun en mi carne he de ver a Dios.' },
    ],
  },
  24: {
    day: 24,
    reference: 'Jeremías 1:5; 31:33',
    contextSummary: 'Jehová revela a Jeremías su llamamiento preordenado y profetiza el nuevo convenio en el que Su ley estará grabada en el corazón de Sus hijos.',
    verses: [
      { verseNumber: '1:5', text: 'Antes que te formase en el vientre, te conocí; y antes que nacieses, te santifiqué; te di por profeta a las naciones.' },
      { verseNumber: '31:33', text: 'Mas este es el convenio que haré con la casa de Israel después de aquellos días, dice Jehová: Daré mi ley en su mente y la escribiré en su corazón; y yo seré su Dios, y ellos serán mi pueblo.' },
    ],
  },
  25: {
    day: 25,
    reference: 'Génesis 24:15–20',
    contextSummary: 'Rebeca demuestra bondad y diligencia sirviendo con alegría al siervo de Abraham y dando agua a sus camellos, cumpliendo la señal del Señor.',
    verses: [
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
    reference: 'Daniel 1:8; 6:10, 20–22',
    contextSummary: 'Daniel persevera en fidelidad a las leyes de Dios en Babilonia, orando con devoción tres veces al día y siendo librado milagrosamente del foso de los leones.',
    verses: [
      { verseNumber: '1:8', text: 'Y Daniel propuso en su corazón no contaminarse con la porción de la comida del rey ni con el vino que él bebía; pidió, por tanto, al jefe de los eunucos que no se le obligase a contaminarse.' },
      { verseNumber: '6:10', text: 'Y cuando Daniel supo que el edicto había sido firmado, entró en su casa, y abiertas las ventanas de su cámara que daban hacia Jerusalén, se arrodillaba tres veces al día, y oraba y daba gracias delante de su Dios, como solía hacer antes.' },
      { verseNumber: '6:20', text: 'Y acercándose al foso, llamó a voces a Daniel con voz triste... Daniel, siervo del Dios viviente, ¿el Dios tuyo, a quien tú continuamente sirves, te ha podido librar de los leones?' },
      { verseNumber: '6:21', text: 'Entonces Daniel habló con el rey: ¡Oh rey, vive para siempre!' },
      { verseNumber: '6:22', text: 'Mi Dios envió su ángel, el cual cerró la boca de los leones, para que no me hiciesen daño, porque ante él fui hallado inocente; y aun delante de ti, oh rey, yo no he hecho nada malo.' },
    ],
  },
  27: {
    day: 27,
    reference: 'Éxodo 18:17–24',
    contextSummary: 'Jetro aconseja sabiamente a Moisés delegar responsabilidades en líderes rectos para aligerar la carga y bendecir a toda la congregación de Israel.',
    verses: [
      { verseNumber: 17, text: 'Entonces el suegro de Moisés le dijo: No está bien lo que haces.' },
      { verseNumber: 18, text: 'Desfallecerás del todo, tú y también este pueblo que está contigo, porque el trabajo es demasiado pesado para ti; no podrás hacerlo tú solo.' },
      { verseNumber: 19, text: 'Oye ahora mi voz; yo te aconsejaré, y Dios estará contigo...' },
      { verseNumber: 21, text: 'Además escoge tú de entre todo el pueblo varones de virtud, temerosos de Dios, varones de verdad, que aborrezcan la avaricia; y ponlos sobre el pueblo por jefes de millares, de centenas, de cincuenta y de diez.' },
      { verseNumber: 24, text: 'Y oyó Moisés la voz de su suegro, e hizo todo lo que él dijo.' },
    ],
  },
  28: {
    day: 28,
    reference: '2 Reyes 5:2–4',
    contextSummary: 'Una joven israelita cautiva testifica con fe sobre el profeta de Dios a la esposa de Naamán, guiándolo hacia su sanación y conversión.',
    verses: [
      { verseNumber: 2, text: 'Y de Siria habían salido bandas armadas y habían llevado cautiva de la tierra de Israel a una muchacha, la cual servía a la esposa de Naamán.' },
      { verseNumber: 3, text: 'Esta dijo a su señora: Si mi señor rogase al profeta que está en Samaria, él lo sanaría de su lepra.' },
      { verseNumber: 4, text: 'Y entrando Naamán a su señor, se lo declaró, diciendo: Así y así ha dicho la muchacha que es de la tierra de Israel.' },
    ],
  },
  29: {
    day: 29,
    reference: '1 Samuel 3:8–10',
    contextSummary: 'El joven Samuel escucha la voz de Jehová en el santuario y, guiado por Elí, responde con reverencia y disposición a servir.',
    verses: [
      { verseNumber: 8, text: 'Jehová, pues, llamó la tercera vez a Samuel. Y él se levantó y vino a Elí y dijo: Heme aquí; ¿para qué me has llamado? Entonces entendió Elí que Jehová llamaba al joven.' },
      { verseNumber: 9, text: 'Y dijo Elí a Samuel: Ve y acuéstate; y si te llama, dirás: Habla, Jehová, porque tu siervo oye. Así se fue Samuel y se acostó en su lugar.' },
      { verseNumber: 10, text: 'Y vino Jehová, y se puso allí y llamó como las otras veces: ¡Samuel, Samuel! Entonces Samuel dijo: Habla, porque tu siervo oye.' },
    ],
  },
  30: {
    day: 30,
    reference: 'Éxodo 17:10–13',
    contextSummary: 'Aarón y Hur sostienen las manos cansadas del profeta Moisés en la colina, permitiendo que Israel prevalezca en la batalla.',
    verses: [
      { verseNumber: 10, text: 'E hizo Josué como le dijo Moisés, peleando contra Amalec; y Moisés, y Aarón y Hur subieron a la cumbre del collado.' },
      { verseNumber: 11, text: 'Y acontecía que, cuando alzaba Moisés su mano, Israel prevalecía; mas cuando él bajaba su mano, prevalecía Amalec.' },
      { verseNumber: 12, text: 'Y las manos de Moisés se cansaban; por lo que tomaron una piedra y la pusieron debajo de él, y se sentó sobre ella; y Aarón y Hur sostenían sus manos, el uno de un lado y el otro del otro; así hubo en sus manos firmeza hasta que se puso el sol.' },
      { verseNumber: 13, text: 'Y Josué deshizo a Amalec y a su pueblo a filo de espada.' },
    ],
  },
  31: {
    day: 31,
    reference: 'Juan 14:6; Isaías 53:3–5; 2 Nefi 25:26',
    contextSummary: 'El testimonio culminante del desafío: Jesucristo como el camino, la verdad y la vida, cuyo sacrificio expiatorio sana nuestras almas y renueva nuestra fe.',
    verses: [
      { verseNumber: 'Juan 14:6', text: 'Jesús le dijo: Yo soy el camino, y la verdad y la vida; nadie viene al Padre sino por mí.' },
      { verseNumber: 'Isaías 53:3', text: 'Despreciado y desechado entre los hombres, varón de dolores, experimentado en quebranto; y como que escondimos de él el rostro, fue menospreciado y no lo estimamos.' },
      { verseNumber: 'Isaías 53:4', text: 'Ciertamente llevó él nuestras enfermedades y sufrió nuestros dolores; y nosotros le tuvimos por azotado, por herido de Dios y abatido.' },
      { verseNumber: 'Isaías 53:5', text: 'Mas él fue herido por nuestras transgresiones, molido por nuestras iniquidades; el castigo de nuestra paz fue sobre él, y por sus llagas fuimos nosotros sanados.' },
      { verseNumber: '2 Nefi 25:26', text: 'Y hablamos de Cristo, nos regocijamos en Cristo, predicamos de Cristo, profetizamos de Cristo y escribimos según nuestras profecías, para que nuestros hijos sepan a qué fuente han de acudir para la remisión de sus pecados.' },
    ],
  },
};
