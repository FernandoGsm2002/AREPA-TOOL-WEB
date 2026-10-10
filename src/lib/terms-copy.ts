import type { Locale } from "@/lib/i18n";

export const TERMS_VERSION = "2026-10-10";

type TermsSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type TermsCopy = {
  eyebrow: string;
  title: string;
  summary: string;
  warning: string;
  checkboxPrefix: string;
  termsLink: string;
  checkboxSuffix: string;
  readFull: string;
  accept: string;
  decline: string;
  back: string;
  close: string;
  documentTitle: string;
  documentIntro: string;
  sections: TermsSection[];
  declinedTitle: string;
  declinedBody: string;
  reviewAgain: string;
};

export const termsCopy: Record<Locale, TermsCopy> = {
  es: {
    eyebrow: "Acceso responsable",
    title: "Aviso de uso responsable",
    summary:
      "ArepaTool es una herramienta técnica para trabajar únicamente con dispositivos legítimos propios o con autorización válida del propietario.",
    warning:
      "Sus operaciones pueden borrar datos, modificar particiones o firmware y causar pérdida de garantía, fallos de software o daños permanentes.",
    checkboxPrefix: "He leído y acepto los",
    termsLink: "Términos y condiciones",
    checkboxSuffix: "y continúo bajo mi propia responsabilidad.",
    readFull: "Leer el documento completo",
    accept: "Aceptar y continuar",
    decline: "No acepto",
    back: "Volver",
    close: "Cerrar",
    documentTitle: "Aviso de uso responsable, términos y condiciones",
    documentIntro:
      "Antes de utilizar ArepaTool, el usuario declara haber leído, entendido y aceptado este aviso de uso responsable y sus términos y condiciones.",
    sections: [
      {
        title: "Uso autorizado de ArepaTool",
        paragraphs: [
          "ArepaTool es una herramienta técnica destinada únicamente al diagnóstico, reparación, mantenimiento, restauración, flasheo, desbloqueo, lectura, escritura, borrado o modificación de software en dispositivos móviles legítimos, siempre que el usuario sea el propietario legal del equipo o cuente con autorización previa, expresa y válida del dueño, administrador, empresa, cliente u operador correspondiente.",
          "ArepaTool no promueve, autoriza ni facilita el uso ilegal de sus funciones. La herramienta debe utilizarse exclusivamente con fines legítimos de reparación, mantenimiento, recuperación, soporte técnico o administración autorizada. Cualquier uso indebido, no autorizado o contrario a la ley será responsabilidad exclusiva del usuario.",
        ],
      },
      {
        title: "Riesgos técnicos y responsabilidad",
        paragraphs: [
          "El usuario utiliza ArepaTool bajo su propia responsabilidad. Sus funciones pueden afectar el funcionamiento del dispositivo, borrar información, modificar particiones, cambiar configuraciones del sistema o estados de arranque, flashear firmware, ejecutar comandos ADB o Fastboot, usar módulos MTK o SPD, procesar loaders, modificar archivos, eliminar bloqueos, restablecer configuraciones o causar pérdida de datos, fallos de software, brick, pérdida de garantía o daños permanentes.",
          "ArepaTool, sus desarrolladores, administradores, distribuidores y colaboradores no se hacen responsables por daños directos, indirectos, accidentales, técnicos, legales, económicos o de cualquier otro tipo derivados del uso correcto o incorrecto de la herramienta. Esto incluye, sin limitarse a ello, pérdida de información, daño del dispositivo, uso de firmware o archivos incorrectos, operaciones interrumpidas, uso en modelos no compatibles, desbloqueos no autorizados, manipulación de particiones, afectación de garantías, incumplimiento de contratos, bloqueo de cuentas o cualquier consecuencia legal causada por el usuario.",
        ],
      },
      {
        title: "Usos prohibidos",
        paragraphs: [
          "El usuario se compromete a utilizar ArepaTool únicamente en equipos legítimos y con autorización legal. Queda estrictamente prohibido usar la herramienta en dispositivos robados, extraviados, financiados sin autorización, bloqueados por terceros o pertenecientes a empresas, instituciones, clientes u otras personas sin consentimiento válido.",
          "También queda prohibido utilizar sus funciones para evadir medidas de seguridad, restricciones de administración, bloqueos antirrobo, bloqueos de cuenta, bloqueos empresariales, bloqueos de operador, controles MDM, KG, FRP u otros mecanismos de protección sin autorización legal expresa.",
        ],
      },
      {
        title: "Preparación técnica",
        paragraphs: [
          "Algunas funciones requieren conocimientos técnicos avanzados. Antes de ejecutar una operación, el usuario es responsable de verificar el modelo exacto, firmware compatible, batería, controladores, conexión USB, respaldos, archivos seleccionados, comandos que se ejecutarán y legalidad de la intervención. El desconocimiento técnico, el error humano o la selección incorrecta de una función no liberan al usuario de su responsabilidad.",
        ],
      },
      {
        title: "Al continuar, el usuario confirma que:",
        bullets: [
          "Es propietario legal del dispositivo o cuenta con autorización válida del propietario.",
          "Comprende los riesgos técnicos y legales del uso de la herramienta.",
          "Acepta que cualquier operación se realiza bajo su propia responsabilidad.",
          "Ha realizado o acepta realizar los respaldos necesarios antes de proceder.",
          "No utilizará ArepaTool para fines ilegales, fraudulentos, no autorizados o indebidos.",
          "Libera a ArepaTool, sus desarrolladores, administradores, distribuidores y colaboradores de cualquier responsabilidad derivada del uso de la herramienta.",
        ],
      },
      {
        title: "Recopilación y uso de datos de operaciones",
        paragraphs: [
          "El usuario acepta y autoriza a ArepaTool a recopilar, almacenar y analizar datos relacionados con las operaciones realizadas dentro de la herramienta para mejorar su funcionamiento, estabilidad, compatibilidad, seguridad, rendimiento, detección de errores, análisis estadístico y futuras mejoras.",
          "Estos datos pueden incluir el tipo de operación, modelo o identificador técnico del dispositivo cuando sea necesario, estado y duración de la operación, errores, versión de la herramienta, información de compatibilidad, registros técnicos y datos necesarios para diagnosticar fallos o mejorar la experiencia del usuario.",
          "ArepaTool no utilizará estos datos para fines ajenos al funcionamiento, mantenimiento, análisis, seguridad o mejora de la herramienta. Los datos no serán vendidos, cedidos ni publicados, y se aplicarán medidas razonables para protegerlos frente a accesos no autorizados, pérdida, alteración o uso indebido.",
        ],
      },
      {
        title: "Aceptación",
        paragraphs: [
          "Al aceptar estos términos, el usuario autoriza expresamente la recopilación y el uso de los datos de operación descritos. Si no acepta estas condiciones, no debe utilizar ArepaTool ni ejecutar ninguna de sus funciones.",
        ],
      },
    ],
    declinedTitle: "Acceso no autorizado",
    declinedBody:
      "No puedes acceder a ArepaTool sin aceptar el aviso de uso responsable y los términos y condiciones.",
    reviewAgain: "Revisar los términos",
  },
  en: {
    eyebrow: "Responsible access",
    title: "Responsible use notice",
    summary:
      "ArepaTool is a technical tool intended only for legitimate devices you own or are validly authorized to service.",
    warning:
      "Its operations may erase data, modify partitions or firmware, and cause warranty loss, software failure, or permanent damage.",
    checkboxPrefix: "I have read and accept the",
    termsLink: "Terms and Conditions",
    checkboxSuffix: "and I continue under my own responsibility.",
    readFull: "Read the full document",
    accept: "Accept and continue",
    decline: "I do not accept",
    back: "Back",
    close: "Close",
    documentTitle: "Responsible use notice, terms and conditions",
    documentIntro:
      "Before using ArepaTool, the user declares that they have read, understood, and accepted this responsible use notice and its terms and conditions.",
    sections: [
      {
        title: "Authorized use of ArepaTool",
        paragraphs: [
          "ArepaTool is a technical tool intended solely for diagnostics, repair, maintenance, restoration, flashing, unlocking, reading, writing, erasing, or modifying software on legitimate mobile devices, provided that the user is the device's legal owner or has prior, express, and valid authorization from the relevant owner, administrator, company, customer, or operator.",
          "ArepaTool does not promote, authorize, or facilitate illegal use of its functions. The tool must be used exclusively for legitimate repair, maintenance, recovery, technical support, or authorized administration. Any improper, unauthorized, or unlawful use is the user's sole responsibility.",
        ],
      },
      {
        title: "Technical risks and liability",
        paragraphs: [
          "The user operates ArepaTool at their own risk. Its functions may affect device operation, erase information, modify partitions, change system or boot settings, flash firmware, run ADB or Fastboot commands, use MTK or SPD modules, process loaders, modify files, remove locks, reset settings, or cause data loss, software failure, bricking, warranty loss, or permanent damage.",
          "ArepaTool, its developers, administrators, distributors, and contributors are not responsible for direct, indirect, accidental, technical, legal, financial, or other damages arising from proper or improper use of the tool. This includes, without limitation, data loss, device damage, incorrect firmware or files, interrupted operations, unsupported models, unauthorized unlocking, partition manipulation, warranty impact, contractual breaches, account restrictions, or legal consequences caused by the user.",
        ],
      },
      {
        title: "Prohibited uses",
        paragraphs: [
          "The user agrees to use ArepaTool only on legitimate devices and with legal authorization. Using the tool on stolen, lost, unauthorized financed, third-party locked, corporate, institutional, customer, or other persons' devices without valid consent is strictly prohibited.",
          "Using its functions to bypass security measures, management restrictions, anti-theft locks, account locks, enterprise controls, carrier locks, MDM, KG, FRP, or other protection mechanisms without express legal authorization is also prohibited.",
        ],
      },
      {
        title: "Technical preparation",
        paragraphs: [
          "Some functions require advanced technical knowledge. Before running an operation, the user is responsible for checking the exact model, compatible firmware, battery level, drivers, USB connection, backups, selected files, commands to be executed, and the legality of the intervention. Lack of technical knowledge, human error, or choosing the wrong function does not release the user from responsibility.",
        ],
      },
      {
        title: "By continuing, the user confirms that:",
        bullets: [
          "They are the device's legal owner or have valid authorization from the owner.",
          "They understand the technical and legal risks of using the tool.",
          "They accept that every operation is performed under their own responsibility.",
          "They have made, or agree to make, the necessary backups before proceeding.",
          "They will not use ArepaTool for illegal, fraudulent, unauthorized, or improper purposes.",
          "They release ArepaTool, its developers, administrators, distributors, and contributors from liability arising from use of the tool.",
        ],
      },
      {
        title: "Collection and use of operation data",
        paragraphs: [
          "The user agrees and consents to ArepaTool collecting, storing, and analyzing data related to operations performed in the tool to improve functionality, stability, compatibility, security, performance, error detection, statistical analysis, and future development.",
          "This data may include operation type, device model or technical identifier when necessary, operation status and duration, errors, tool version, compatibility information, technical logs, and data required to diagnose failures or improve the user experience.",
          "ArepaTool will not use this data for purposes unrelated to operation, maintenance, analysis, security, or improvement of the tool. The data will not be sold, transferred, or published, and reasonable safeguards will be applied against unauthorized access, loss, alteration, or misuse.",
        ],
      },
      {
        title: "Acceptance",
        paragraphs: [
          "By accepting these terms, the user expressly authorizes the collection and use of the operation data described above. If the user does not accept these conditions, they must not use ArepaTool or run any of its functions.",
        ],
      },
    ],
    declinedTitle: "Access not authorized",
    declinedBody:
      "You cannot access ArepaTool without accepting the responsible use notice and the terms and conditions.",
    reviewAgain: "Review the terms",
  },
  "pt-br": {
    eyebrow: "Acesso responsável",
    title: "Aviso de uso responsável",
    summary:
      "A ArepaTool é uma ferramenta técnica destinada somente a dispositivos legítimos de sua propriedade ou para os quais você tenha autorização válida.",
    warning:
      "Suas operações podem apagar dados, modificar partições ou firmware e causar perda de garantia, falhas de software ou danos permanentes.",
    checkboxPrefix: "Li e aceito os",
    termsLink: "Termos e Condições",
    checkboxSuffix: "e continuo sob minha própria responsabilidade.",
    readFull: "Ler o documento completo",
    accept: "Aceitar e continuar",
    decline: "Não aceito",
    back: "Voltar",
    close: "Fechar",
    documentTitle: "Aviso de uso responsável, termos e condições",
    documentIntro:
      "Antes de usar a ArepaTool, o usuário declara ter lido, compreendido e aceitado este aviso de uso responsável e seus termos e condições.",
    sections: [
      {
        title: "Uso autorizado da ArepaTool",
        paragraphs: [
          "A ArepaTool é uma ferramenta técnica destinada exclusivamente ao diagnóstico, reparo, manutenção, restauração, flash, desbloqueio, leitura, gravação, apagamento ou modificação de software em dispositivos móveis legítimos, desde que o usuário seja o proprietário legal do aparelho ou tenha autorização prévia, expressa e válida do proprietário, administrador, empresa, cliente ou operadora correspondente.",
          "A ArepaTool não promove, autoriza nem facilita o uso ilegal de suas funções. A ferramenta deve ser usada exclusivamente para reparo, manutenção, recuperação, suporte técnico ou administração autorizada. Qualquer uso indevido, não autorizado ou contrário à lei será de responsabilidade exclusiva do usuário.",
        ],
      },
      {
        title: "Riscos técnicos e responsabilidade",
        paragraphs: [
          "O usuário utiliza a ArepaTool por sua própria conta e risco. Suas funções podem afetar o funcionamento do dispositivo, apagar informações, modificar partições, alterar configurações do sistema ou de inicialização, instalar firmware, executar comandos ADB ou Fastboot, usar módulos MTK ou SPD, processar loaders, modificar arquivos, remover bloqueios, redefinir configurações ou causar perda de dados, falha de software, brick, perda de garantia ou danos permanentes.",
          "A ArepaTool, seus desenvolvedores, administradores, distribuidores e colaboradores não se responsabilizam por danos diretos, indiretos, acidentais, técnicos, legais, financeiros ou de qualquer outra natureza decorrentes do uso correto ou incorreto da ferramenta. Isso inclui, sem limitação, perda de dados, dano ao aparelho, uso de firmware ou arquivos incorretos, operações interrompidas, modelos incompatíveis, desbloqueios não autorizados, manipulação de partições, perda de garantia, descumprimento de contratos, bloqueio de contas ou consequências legais causadas pelo usuário.",
        ],
      },
      {
        title: "Usos proibidos",
        paragraphs: [
          "O usuário concorda em usar a ArepaTool somente em dispositivos legítimos e com autorização legal. É estritamente proibido usar a ferramenta em dispositivos roubados, perdidos, financiados sem autorização, bloqueados por terceiros ou pertencentes a empresas, instituições, clientes ou outras pessoas sem consentimento válido.",
          "Também é proibido usar suas funções para contornar medidas de segurança, restrições administrativas, bloqueios antirroubo, bloqueios de conta, controles empresariais, bloqueios de operadora, MDM, KG, FRP ou outros mecanismos de proteção sem autorização legal expressa.",
        ],
      },
      {
        title: "Preparação técnica",
        paragraphs: [
          "Algumas funções exigem conhecimento técnico avançado. Antes de executar uma operação, o usuário é responsável por verificar o modelo exato, firmware compatível, bateria, drivers, conexão USB, backups, arquivos selecionados, comandos que serão executados e a legalidade da intervenção. O desconhecimento técnico, erro humano ou escolha incorreta de uma função não isenta o usuário de responsabilidade.",
        ],
      },
      {
        title: "Ao continuar, o usuário confirma que:",
        bullets: [
          "É o proprietário legal do dispositivo ou possui autorização válida do proprietário.",
          "Compreende os riscos técnicos e legais do uso da ferramenta.",
          "Aceita que toda operação é realizada sob sua própria responsabilidade.",
          "Realizou ou concorda em realizar os backups necessários antes de prosseguir.",
          "Não usará a ArepaTool para fins ilegais, fraudulentos, não autorizados ou indevidos.",
          "Isenta a ArepaTool, seus desenvolvedores, administradores, distribuidores e colaboradores de responsabilidade decorrente do uso da ferramenta.",
        ],
      },
      {
        title: "Coleta e uso de dados de operações",
        paragraphs: [
          "O usuário concorda e autoriza a ArepaTool a coletar, armazenar e analisar dados relacionados às operações realizadas na ferramenta para melhorar funcionamento, estabilidade, compatibilidade, segurança, desempenho, detecção de erros, análise estatística e futuras melhorias.",
          "Esses dados podem incluir tipo de operação, modelo ou identificador técnico do dispositivo quando necessário, status e duração da operação, erros, versão da ferramenta, informações de compatibilidade, registros técnicos e dados necessários para diagnosticar falhas ou melhorar a experiência do usuário.",
          "A ArepaTool não usará esses dados para finalidades alheias ao funcionamento, manutenção, análise, segurança ou melhoria da ferramenta. Os dados não serão vendidos, cedidos nem publicados, e serão aplicadas medidas razoáveis de proteção contra acesso não autorizado, perda, alteração ou uso indevido.",
        ],
      },
      {
        title: "Aceitação",
        paragraphs: [
          "Ao aceitar estes termos, o usuário autoriza expressamente a coleta e o uso dos dados de operação descritos. Se não aceitar estas condições, não deverá usar a ArepaTool nem executar nenhuma de suas funções.",
        ],
      },
    ],
    declinedTitle: "Acesso não autorizado",
    declinedBody:
      "Você não pode acessar a ArepaTool sem aceitar o aviso de uso responsável e os termos e condições.",
    reviewAgain: "Revisar os termos",
  },
};
