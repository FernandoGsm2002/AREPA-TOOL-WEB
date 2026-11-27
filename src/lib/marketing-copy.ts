import type { Locale } from './i18n';

export const marketingCopy = {
  es: {
    headline: 'Más soluciones.', accent: 'Una sola herramienta.', intro: 'ArepaTool reúne herramientas de servicio para Android y Apple en tu PC. Consulta la compatibilidad, elige tu módulo y prepara el próximo trabajo de tu taller.', download: 'Descargar para Windows', plans: 'Ver licencias', models: 'Consultar modelos', proof: ['Android y Apple', 'Actualizaciones incluidas', 'Resellers oficiales'],
    preview: 'Explora los módulos', previewNote: 'Vista ilustrativa de los módulos. La disponibilidad depende del equipo.', workspace: 'Tu espacio de trabajo', available: 'Cobertura y herramientas',
    modules: [
      { name: 'Android', title: 'Las marcas de tu día a día.', description: 'Samsung, Motorola y Xiaomi, con operaciones organizadas por marca y modo de conexión.', items: ['Samsung · ADB y Download Mode', 'Motorola · MediaTek y Fastboot', 'Xiaomi · Mi Assistant Mode'] },
      { name: 'MediaTek', title: 'Un espacio para MediaTek.', description: 'Consulta las funciones disponibles para el modelo y la versión de tu dispositivo.', items: ['Infinix · TECNO · Itel', 'Herramientas en modo Meta', 'Gestión de particiones'] },
      { name: 'Apple', title: 'Tu módulo Apple, a mano.', description: 'Consulta los equipos compatibles y los requisitos antes de comenzar.', items: ['iPhone Universal', 'Consulta de compatibilidad', 'Rust AIO · Bunny Ramdisk'] },
      { name: 'Utilidades', title: 'Completa tu mesa de trabajo.', description: 'Encuentra las herramientas auxiliares y las guías para preparar tu entorno.', items: ['USB Redirector', 'ArepaHotspot', 'Tutoriales y manuales'] },
    ], brands: 'Un espacio para las marcas con las que trabajas.', coverageTitle: 'Conoce tu herramienta antes de conectar.', coverageIntro: 'Del modelo compatible a la última actualización: la información para preparar tu trabajo, en un solo lugar.',
    resources: [
      { title: 'Encuentra tu modelo', text: 'Revisa la cobertura disponible para la marca, el chipset y la versión del equipo.', action: 'Modelos soportados', href: '/supportedmodels' },
      { title: 'Conoce cada módulo', text: 'Explora las funciones de Android, MediaTek, Unisoc, Apple y las utilidades.', action: 'Ver características', href: '/features' },
      { title: 'Aprende con las guías', text: 'Prepara los controladores y revisa los tutoriales antes de iniciar una operación.', action: 'Ver tutoriales', href: '/tutorials' },
    ], pricingTitle: 'La misma herramienta. Tu tiempo.', pricingIntro: 'Elige la duración de tu licencia. Actívala con un reseller oficial y recibe las actualizaciones durante su vigencia.', annual: 'Acceso anual', included: ['Licencia ArepaTool', 'Actualizaciones durante la vigencia', 'Acceso a los módulos compatibles'], activation: 'Activación con reseller oficial', buyPlan: 'Elegir licencia', creditTitle: 'Créditos, cuando los necesites.', creditNote: 'Los servicios con costo en créditos se cobran por separado. Los créditos no sustituyen una licencia activa.', buyCredits: 'Comprar créditos', newAccount: '¿Aún no tienes cuenta?', createAccount: 'Crear cuenta',
    latest: 'La herramienta sigue creciendo.', releaseIntro: 'Consulta las novedades publicadas y la lista de modelos de cada actualización.', releaseAction: 'Ver todas las actualizaciones', releaseDetails: 'Ver notas completas de esta versión',
    startTitle: 'Tu taller empieza aquí.', startIntro: 'Registra tu cuenta, activa tu licencia y descarga ArepaTool. Un mismo usuario en la web y en la aplicación.', steps: ['Crea tu cuenta', 'Activa con un reseller', 'Descarga e inicia sesión'], faqTitle: 'Antes de empezar.',
    faq: [
      ['¿Cómo activo mi licencia?', 'Crea tu cuenta y contacta a un reseller oficial. El reseller activa la licencia en tu usuario; después puedes iniciar sesión en ArepaTool.'],
      ['¿La licencia incluye todos los servicios?', 'La licencia permite acceder a la herramienta. Algunas operaciones, como Xiaomi Auth, consumen créditos adicionales. Consulta el precio mostrado antes de iniciar.'],
      ['¿Puedo entrar solo con créditos?', 'Necesitas una licencia activa para acceder a la herramienta. Los créditos quedan disponibles para las operaciones que los requieren.'],
      ['¿Cómo compruebo si mi equipo está soportado?', 'Revisa Modelos soportados y los requisitos del método. La compatibilidad depende del modelo, versión, nivel de seguridad y modo de conexión.'],
    ], downloadFooter: 'Descarga pública para Windows. Tu licencia se activa con un reseller oficial.', resourcesLabel: 'Recursos', menu: 'Abrir menú', skip: 'Ir al contenido',
  },
  en: {
    headline: 'More solutions.', accent: 'One tool.', intro: 'ArepaTool brings Android and Apple servicing tools to your PC. Check compatibility, choose a module and prepare for your workshop’s next job.', download: 'Download for Windows', plans: 'View licenses', models: 'Browse supported models', proof: ['Android & Apple', 'Updates included', 'Official resellers'],
    preview: 'Explore the modules', previewNote: 'Illustrative module preview. Availability depends on the device.', workspace: 'Your workspace', available: 'Coverage & tools',
    modules: [
      { name: 'Android', title: 'The brands on your bench.', description: 'Samsung, Motorola and Xiaomi, with operations organized by brand and connection mode.', items: ['Samsung · ADB & Download Mode', 'Motorola · MediaTek & Fastboot', 'Xiaomi · Mi Assistant Mode'] },
      { name: 'MediaTek', title: 'A workspace for MediaTek.', description: 'Check the available features for your exact device model and version.', items: ['Infinix · TECNO · Itel', 'Meta mode tools', 'Partition management'] },
      { name: 'Apple', title: 'Your Apple module, at hand.', description: 'Check compatible devices and requirements before you begin.', items: ['iPhone Universal', 'Compatibility check', 'Rust AIO · Bunny Ramdisk'] },
      { name: 'Utilities', title: 'Complete your workspace.', description: 'Find supporting tools and guides to prepare your setup.', items: ['USB Redirector', 'ArepaHotspot', 'Tutorials & guides'] },
    ], brands: 'A workspace for the brands you work with.', coverageTitle: 'Know your tool before you connect.', coverageIntro: 'From device coverage to the latest release: the information to prepare your work, in one place.',
    resources: [
      { title: 'Find your model', text: 'Check available coverage for the brand, chipset and device version.', action: 'Supported models', href: '/supportedmodels' },
      { title: 'Explore each module', text: 'Discover Android, MediaTek, Unisoc, Apple and utility features.', action: 'View features', href: '/features' },
      { title: 'Learn with the guides', text: 'Prepare your drivers and review the tutorials before starting an operation.', action: 'Watch tutorials', href: '/tutorials' },
    ], pricingTitle: 'One tool. Your timeline.', pricingIntro: 'Choose your license duration. Activate through an official reseller and receive updates while your license is active.', annual: 'Annual access', included: ['ArepaTool license', 'Updates while your license is active', 'Access to supported modules'], activation: 'Activated by an official reseller', buyPlan: 'Choose license', creditTitle: 'Credits, when you need them.', creditNote: 'Credit-based services are billed separately. Credits do not replace an active license.', buyCredits: 'Buy credits', newAccount: 'New to ArepaTool?', createAccount: 'Create account',
    latest: 'The tool keeps growing.', releaseIntro: 'Explore published improvements and the model list for each release.', releaseAction: 'View all updates', releaseDetails: 'Read the full release notes', startTitle: 'Your workshop starts here.', startIntro: 'Register, activate your license and download ArepaTool. Use the same account on the website and in the app.', steps: ['Create your account', 'Activate with a reseller', 'Download and sign in'], faqTitle: 'Before you begin.',
    faq: [
      ['How do I activate my license?', 'Create an account and contact an official reseller. They activate the license for your username, then you can sign in to ArepaTool.'],
      ['Does the license include every service?', 'The license gives you access to the tool. Some operations, such as Xiaomi Auth, require additional credits. Check the displayed price before starting.'],
      ['Can I sign in with credits alone?', 'You need an active license to access the tool. Your credits remain available for operations that require them.'],
      ['How do I check device support?', 'Review Supported models and the method requirements. Compatibility depends on the model, version, security level and connection mode.'],
    ], downloadFooter: 'Public download for Windows. Activate your license through an official reseller.', resourcesLabel: 'Resources', menu: 'Open menu', skip: 'Skip to content',
  },
  'pt-br': {
    headline: 'Mais soluções.', accent: 'Uma só ferramenta.', intro: 'A ArepaTool reúne ferramentas de serviço para Android e Apple no seu PC. Consulte a compatibilidade, escolha o módulo e prepare o próximo trabalho da sua oficina.', download: 'Baixar para Windows', plans: 'Ver licenças', models: 'Consultar modelos', proof: ['Android e Apple', 'Atualizações incluídas', 'Revendedores oficiais'],
    preview: 'Explore os módulos', previewNote: 'Prévia ilustrativa dos módulos. A disponibilidade depende do aparelho.', workspace: 'Seu espaço de trabalho', available: 'Compatibilidade e ferramentas',
    modules: [
      { name: 'Android', title: 'As marcas do seu dia a dia.', description: 'Samsung, Motorola e Xiaomi, com operações organizadas por marca e modo de conexão.', items: ['Samsung · ADB e Download Mode', 'Motorola · MediaTek e Fastboot', 'Xiaomi · Mi Assistant Mode'] },
      { name: 'MediaTek', title: 'Um espaço para MediaTek.', description: 'Consulte as funções disponíveis para o modelo e a versão do seu aparelho.', items: ['Infinix · TECNO · Itel', 'Ferramentas no modo Meta', 'Gerenciamento de partições'] },
      { name: 'Apple', title: 'Seu módulo Apple à mão.', description: 'Confira os aparelhos compatíveis e os requisitos antes de começar.', items: ['iPhone Universal', 'Consulta de compatibilidade', 'Rust AIO · Bunny Ramdisk'] },
      { name: 'Utilitários', title: 'Complete sua bancada.', description: 'Encontre ferramentas auxiliares e guias para preparar seu ambiente.', items: ['USB Redirector', 'ArepaHotspot', 'Tutoriais e manuais'] },
    ], brands: 'Um espaço para as marcas com que você trabalha.', coverageTitle: 'Conheça a ferramenta antes de conectar.', coverageIntro: 'Da compatibilidade à última atualização: as informações para preparar seu trabalho em um só lugar.',
    resources: [
      { title: 'Encontre seu modelo', text: 'Confira a compatibilidade por marca, chipset e versão do aparelho.', action: 'Modelos compatíveis', href: '/supportedmodels' },
      { title: 'Conheça cada módulo', text: 'Explore os recursos de Android, MediaTek, Unisoc, Apple e utilitários.', action: 'Ver recursos', href: '/features' },
      { title: 'Aprenda com os guias', text: 'Prepare os drivers e confira os tutoriais antes de iniciar uma operação.', action: 'Ver tutoriais', href: '/tutorials' },
    ], pricingTitle: 'Uma ferramenta. Seu tempo.', pricingIntro: 'Escolha a duração da licença. Ative com um revendedor oficial e receba atualizações durante a vigência.', annual: 'Acesso anual', included: ['Licença ArepaTool', 'Atualizações durante a vigência', 'Acesso aos módulos compatíveis'], activation: 'Ativação com revendedor oficial', buyPlan: 'Escolher licença', creditTitle: 'Créditos quando precisar.', creditNote: 'Os serviços com custo em créditos são cobrados separadamente. Os créditos não substituem uma licença ativa.', buyCredits: 'Comprar créditos', newAccount: 'Ainda não tem conta?', createAccount: 'Criar conta',
    latest: 'A ferramenta continua crescendo.', releaseIntro: 'Confira as novidades publicadas e a lista de modelos de cada atualização.', releaseAction: 'Ver todas as atualizações', releaseDetails: 'Ver notas completas da versão', startTitle: 'Sua oficina começa aqui.', startIntro: 'Crie sua conta, ative a licença e baixe a ArepaTool. Use a mesma conta no site e no aplicativo.', steps: ['Crie sua conta', 'Ative com um revendedor', 'Baixe e entre'], faqTitle: 'Antes de começar.',
    faq: [
      ['Como ativo minha licença?', 'Crie uma conta e entre em contato com um revendedor oficial. Ele ativa a licença no seu usuário e você pode entrar na ArepaTool.'],
      ['A licença inclui todos os serviços?', 'A licença dá acesso à ferramenta. Algumas operações, como Xiaomi Auth, consomem créditos adicionais. Confira o preço exibido antes de iniciar.'],
      ['Posso entrar somente com créditos?', 'Você precisa de uma licença ativa para acessar a ferramenta. Os créditos ficam disponíveis para as operações que os exigem.'],
      ['Como verifico se meu aparelho é compatível?', 'Consulte Modelos compatíveis e os requisitos do método. A compatibilidade depende do modelo, versão, nível de segurança e modo de conexão.'],
    ], downloadFooter: 'Download público para Windows. Ative sua licença com um revendedor oficial.', resourcesLabel: 'Recursos', menu: 'Abrir menu', skip: 'Ir para o conteúdo',
  },
} satisfies Record<Locale, unknown>;
