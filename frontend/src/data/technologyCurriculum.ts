/**
 * Referentes curriculares de Tecnología e Informática.
 * Fuente: MEN (2022), Orientaciones Curriculares para el Área de Tecnología
 * e Informática en la Educación Básica y Media, sección 3.3.2, pp. 55-65.
 * Las competencias y evidencias se organizan por conjunto de grados.
 */
export type CurriculumComponent = {
  id: string;
  name: string;
  competency: string;
  evidences: string[];
};

export type GradeCurriculum = {
  group: string;
  components: CurriculumComponent[];
};

const curriculumByGroup: Record<string, GradeCurriculum> = {
  "1-3": {
    group: "1.º a 3.º",
    components: [
      { id: "nature", name: "Naturaleza y Evolución de la Tecnología y la Informática",
        competency: "Explico el modo en que los productos tecnológicos facilitan el desarrollo de las actividades, en el presente y el pasado.",
        evidences: [
          "Identifico artefactos analógicos y digitales que facilitan mis actividades y satisfacen mis necesidades cotidianas.",
          "Reconozco las semejanzas y diferencias entre artefactos analógicos y digitales que se utilizan hoy y que no se empleaban en épocas pasadas en las actividades diarias de la casa, el barrio, mi ciudad.",
          "Indico la importancia de algunos artefactos analógicos y digitales para la realización de diversas actividades humanas."
        ] },
      { id: "use", name: "Uso y apropiación de la Tecnología y la Informática",
        competency: "Uso en forma segura y apropiada productos tecnológicos de mi entorno en el desarrollo de actividades cotidianas.",
        evidences: [
          "Utilizo artefactos analógicos y digitales que facilitan el desarrollo de mis actividades cotidianas.",
          "Clasifico y describo artefactos de mi entorno según sus características físicas, uso y procedencia.",
          "Identifico y utilizo símbolos y señales relacionados con la seguridad para el uso de productos tecnológicos."
        ] },
      { id: "problem", name: "Solución de problemas con Tecnología e Informática",
        competency: "Determino las ventajas y desventajas en uso de productos tecnológicos en la solución de problemas de la vida diaria.",
        evidences: [
          "Indago cómo están construidos y cómo funcionan algunos artefactos de uso cotidiano.",
          "Ensamblo y desarmo artefactos y dispositivos sencillos siguiendo instrucciones gráficas.",
          "Identifico secuencias de pasos lógicos en las actividades cotidianas de mi entorno escolar y familiar para introducir las bases del pensamiento algorítmico."
        ] },
      { id: "society", name: "Tecnología, Informática y Sociedad",
        competency: "Reconozco las implicaciones que los productos tecnológicos tienen sobre la vida de las personas y otras especies.",
        evidences: [
          "Manifiesto interés por temas relacionados con la tecnología y la informática a través de preguntas e intercambio de ideas.",
          "Identifico algunas consecuencias en mi salud y el ambiente derivadas del uso de algunos productos tecnológicos analógicos y digitales.",
          "Clasifico el impacto que los desechos tecnológicos y el desperdicio de materiales tiene en la preservación del medio ambiente."
        ] }
    ]
  },
  "4-5": {
    group: "4.º a 5.º",
    components: [
      { id: "nature", name: "Naturaleza y Evolución de la Tecnología y la Informática",
        competency: "Analizo productos tecnológicos, sus procesos de producción, los recursos naturales, saberes y conocimientos involucrados.",
        evidences: [
          "Establezco la manera en que los conocimientos tecnológicos, informáticos y de otras disciplinas están presentes en los productos tecnológicos que empleo para el desarrollo de mis actividades en diversos contextos.",
          "Ejemplifico la manera en que distintos productos, invenciones e innovaciones tecnológicas e informáticas contribuyen al desarrollo de mi familia, comunidad, región y país.",
          "Comparo distintos productos tecnológicos con productos naturales, teniendo en cuenta recursos, procesos y sistemas involucrados en su surgimiento, y la utilidad para las comunidades."
        ] },
      { id: "use", name: "Uso y apropiación de la Tecnología y la Informática",
        competency: "Aprovecho las potencialidades de algunos productos tecnológicos en la realización de actividades en diversos contextos.",
        evidences: [
          "Realizo representaciones gráficas (esquemas, dibujos, diagramas, entre otros) que describen el funcionamiento de los productos tecnológicos.",
          "Interpreto y aplico las instrucciones de los manuales para la utilización de productos tecnológicos.",
          "Utilizo tecnologías de la información y la comunicación disponibles en mi entorno para el desarrollo de diversas actividades."
        ] },
      { id: "problem", name: "Solución de problemas con Tecnología e Informática",
        competency: "Elaboro representaciones gráficas y digitales, modelos o prototipos de productos tecnológicos que contribuyen a la satisfacción de necesidades y solución de problemas presentes en diversos contextos.",
        evidences: [
          "Describo con esquemas, dibujos y textos, instrucciones de ensamble de artefactos tecnológicos.",
          "Comparo ventajas y desventajas de distintas soluciones tecnológicas o informáticas sobre un mismo problema.",
          "Diseño posibles soluciones tecnológicas utilizando maquetas, modelos o programas sencillos de simulación."
        ] },
      { id: "society", name: "Tecnología, Informática y Sociedad",
        competency: "Comprendo situaciones en las que se evidencian los efectos sociales y ambientales, resultado de la producción, uso o disposición final de procesos y artefactos de la tecnología y la informática.",
        evidences: [
          "Identifico algunos bienes y servicios que ofrece mi comunidad y velo por su cuidado y buen uso valorando sus beneficios sociales.",
          "Asocio costumbres culturales con características del entorno y con el uso de diversos artefactos tecnológicos o informáticos.",
          "Me involucro en proyectos tecnológicos o informáticos relacionados con el buen uso de los recursos naturales y la adecuada disposición de los residuos del entorno en el que vivo."
        ] }
    ]
  },
  "6-7": {
    group: "6.º a 7.º",
    components: [
      { id: "nature", name: "Naturaleza y Evolución de la Tecnología y la Informática",
        competency: "Apropio principios y conceptos de la tecnología y la informática, presentes en diversos hitos de la tecnología que le han permitido al hombre transformar el entorno.",
        evidences: [
          "Identifico innovaciones e inventos trascendentales para la sociedad, ubicando y explicando su contexto histórico.",
          "Analizo las razones por las cuales la evolución de técnicas, procesos, herramientas, materiales e información, han contribuido a mejorar la fabricación de artefactos, el diseño de sistemas tecnológicos, la implementación de procesos y el desarrollo computacional a lo largo de la historia.",
          "Represento en estructuras conceptuales los conceptos propios de la tecnología y la informática, que se han empleado en la generación y evolución de productos de la tecnología."
        ] },
      { id: "use", name: "Uso y apropiación de la Tecnología y la Informática",
        competency: "Evalúo con sentido crítico el funcionamiento de algunos productos tecnológicos y su uso adecuado durante la realización de actividades en diversos contextos.",
        evidences: [
          "Aplico normas de seguridad que se deben tener en cuenta para el uso de productos tecnológicos.",
          "Reconozco y uso principios de funcionamiento que sustentan productos de la tecnología.",
          "Uso las tecnologías de la información y la comunicación, para procesar información, comunicar ideas creativamente, trabajar colaborativamente y generar representaciones de la realidad en múltiples formatos."
        ] },
      { id: "problem", name: "Solución de problemas con Tecnología e Informática",
        competency: "Presento diversas alternativas para la satisfacción de necesidades y solución de problemas tecnológicos e informáticos en diferentes contextos.",
        evidences: [
          "Identifico problemas propios del entorno que son susceptibles de ser resueltos a través de soluciones tecnológicas o informáticas.",
          "Selecciono alternativas tecnológicas o informáticas apropiadas, para la solución de un problema, teniendo en cuenta criterios como eficiencia, seguridad, consumo, impacto y costo, entre otros.",
          "Interpreto gráficos, bocetos y planos en diferentes actividades."
        ] },
      { id: "society", name: "Tecnología, Informática y Sociedad",
        competency: "Evalúo los impactos que la transformación de los recursos naturales tiene en el bienestar de la sociedad y en el medio ambiente.",
        evidences: [
          "Indago sobre las posibles acciones que puedo realizar para preservar el ambiente, de acuerdo con normas y regulaciones políticas en el uso y disposición final de productos de las tecnologías.",
          "Participo en discusiones sobre el uso racional de algunos artefactos tecnológicos analógicos y digitales.",
          "Asumo comportamientos legales y respetuosos relacionados con el uso de los recursos tecnológicos o informáticos."
        ] }
    ]
  },
  "8-9": {
    group: "8.º a 9.º",
    components: [
      { id: "nature", name: "Naturaleza y Evolución de la Tecnología y la Informática",
        competency: "Relaciono saberes, conocimientos tecnológicos e informáticos con los conocimientos de otras disciplinas.",
        evidences: [
          "Establezco los impactos que hitos, inventos e innovaciones tecnológicas e informáticas tienen en el desarrollo de saberes y conocimientos tecnológicos e informáticos actuales y futuros.",
          "Comprendo los principios y conocimientos tecnológicos e informáticos que hacen posible el funcionamiento de productos tecnológicos actuales.",
          "Diferencio saberes de orden científico, artístico y social de conceptos propios de la tecnología y la informática."
        ] },
      { id: "use", name: "Uso y apropiación de la Tecnología y la Informática",
        competency: "Utilizo productos tecnológicos adecuados para la solución de una necesidad o problema del entorno.",
        evidences: [
          "Sustento con argumentos (evidencias, razonamiento lógico, experimentación) la selección y utilización de un producto tecnológico analógico o digital para la solución de una necesidad o problema.",
          "Uso eficientemente herramientas tecnológicas e informáticas en el aprendizaje de otras disciplinas.",
          "Empleo correctamente elementos de protección y aplico normas de seguridad cuando involucro artefactos y procesos tecnológicos en las diferentes actividades que realizo."
        ] },
      { id: "problem", name: "Solución de problemas con Tecnología e Informática",
        competency: "Soluciono problemas tecnológicos e informáticos dando cumplimiento a restricciones, condiciones y especificaciones técnicas y contextuales.",
        evidences: [
          "Reconozco que no hay soluciones perfectas, y que pueden existir varias soluciones a un mismo problema según los criterios utilizados y su ponderación.",
          "Detecto fallas o deficiencias en sistemas tecnológicos o informáticos sencillos y propongo soluciones o mejoras.",
          "Diseño programas digitales que permitan dar solución a los problemas propuestos en contextos de la informática, la cibernética, la robótica o la domótica."
        ] },
      { id: "society", name: "Tecnología, Informática y Sociedad",
        competency: "Asumo posturas éticas y responsables que restringen, condicionan y/o mitigan las causas y efectos culturales, sociales y económicos, actuales y futuros, generados por el diseño y desarrollo de productos tecnológicos.",
        evidences: [
          "Mantengo una actitud analítica con relación al uso de productos tecnológicos analógicos y digitales contaminantes y su disposición final.",
          "Tomo decisiones éticas sobre el uso y diseño de productos tecnológicos contemplando diversos puntos de vista e intereses relacionados con la percepción de los problemas y las soluciones tecnológicas.",
          "Utilizo responsablemente productos tecnológicos analógicos y digitales, valorando su pertinencia, calidad y efectos potenciales sobre la salud, privacidad y seguridad personal y colectiva."
        ] }
    ]
  },
  "10-11": {
    group: "10.º a 11.º",
    components: [
      { id: "nature", name: "Naturaleza y Evolución de la Tecnología y la Informática",
        competency: "Construyo conocimientos y saberes de base tecnológica e informática para la toma de decisiones en el desarrollo de productos tecnológicos.",
        evidences: [
          "Sistematizo la evolución tecnológica e informática y la manera cómo incidieron en los cambios estructurales de la sociedad y la cultura a lo largo de la historia.",
          "Argumento a partir de saberes y conocimientos de base tecnológica e informática cómo la evolución de la T&I y sus manifestaciones influyeron e influirán en el desarrollo de las sociedades y las culturas.",
          "Planifico y diseño prototipos que representen realidades tecnológicas e informáticas posibles y futuras en distintos escenarios relacionados con las diversas formas de pensar la T&I."
        ] },
      { id: "use", name: "Uso y apropiación de la Tecnología y la Informática",
        competency: "Genero propuestas innovadoras para el uso y aprovechamiento de productos tecnológicos.",
        evidences: [
          "Utilizo elementos de protección, y aplico normas seguridad industrial y de trabajo, para desarrollar modelos, maquetas, prototipos u otros productos tecnológicos.",
          "Realizo montajes de productos tecnológicos analógicos y/o digitales usando como guías manuales, instrucciones, diagramas y esquemas.",
          "Utilizo adecuadamente herramientas informáticas para la búsqueda, organización, procesamiento, sistematización, comunicación y difusión de ideas."
        ] },
      { id: "problem", name: "Solución de problemas con Tecnología e Informática",
        competency: "Propongo innovaciones tecnológicas e informáticas para la solución de problemas dando cumplimiento a restricciones, condiciones y especificaciones técnicas y contextuales.",
        evidences: [
          "Identifico condiciones, especificaciones y restricciones de diseño, utilizadas en una solución tecnológica o del campo de la informática verificando su cumplimiento en diversos contextos.",
          "Propongo, analizo y comparo diferentes soluciones a un mismo problema de la tecnología o la informática, explicando su origen, ventajas y dificultades.",
          "Diseño, construyo y pruebo prototipos de artefactos, sistemas o procesos como respuesta a una necesidad o problema, teniendo en cuenta las restricciones y especificaciones planteadas."
        ] },
      { id: "society", name: "Tecnología, Informática y Sociedad",
        competency: "Actúo críticamente y de forma argumentada frente a las implicaciones éticas, sociales y ambientales del desarrollo, implementación, uso y disposición final de los productos tecnológicos.",
        evidences: [
          "Participo en deliberaciones argumentadas relacionadas con las aplicaciones e innovaciones tecnológicas e informáticas en diversos campos.",
          "Argumento a favor y en contra sobre el impacto que los desarrollos tecnológicos e informáticos tienen en la sociedad, el medio ambiente y las personas.",
          "Construyo críticamente protocolos de seguridad y de uso ético de los productos tecnológicos para evitar diversos riesgos personales y de mi información en la red."
        ] }
    ]
  }
};

export function getCurriculumForGrade(grade: string): GradeCurriculum {
  const match = String(grade).match(/\d+/);
  const value = match ? Number(match[0]) : 1;
  const key = value <= 3 ? "1-3" : value <= 5 ? "4-5" : value <= 7 ? "6-7" : value <= 9 ? "8-9" : "10-11";
  return curriculumByGroup[key];
}

export const CURRICULUM_GROUPS = [
  { value: "1", label: "1.º" }, { value: "2", label: "2.º" }, { value: "3", label: "3.º" },
  { value: "4", label: "4.º" }, { value: "5", label: "5.º" }, { value: "6", label: "6.º" },
  { value: "7", label: "7.º" }, { value: "8", label: "8.º" }, { value: "9", label: "9.º" },
  { value: "10", label: "10.º" }, { value: "11", label: "11.º" }
];
