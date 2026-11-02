const measure=(a,b,reading,checkpoint)=>[
 {text:`Coloca la punta roja en ${a}.`,tool:'red',target:a,effect:'red',checkpoint},
 {text:`Coloca la punta negra en ${b}.`,tool:'black',target:b,effect:'black',checkpoint},
 {text:'Pulsa MEDIR en el instrumento y registra la lectura.',tool:'meter',target:'measure',effect:'reading',reading,checkpoint,expectedLeads:{red:a,black:b}},
 {text:'Retira ambas puntas antes de continuar.',tool:'meter',target:'release',effect:'release',checkpoint}
];
export const SR_TECHNICAL129={
 diodes:{title:'Técnica · Diagnóstico de diodos',part:'rectifier',asset129:true,summary:'Compara polarización directa e inversa de un módulo aislado y de un diodo patrón. Diagnostica la falla y verifica el repuesto.',targets:{dial:'Selector · modo diodo',A:'Ánodo A',K:'Cátodo K',refA:'Ánodo del patrón',refK:'Cátodo del patrón',measure:'MEDIR',release:'Retirar puntas',module:'Módulo de diodo'},steps:[
 {text:'Selecciona el modo diodo en el multímetro de banco.',tool:'inspect',target:'dial',effect:'mode'},
 ...measure('refA','refK','0.58 V',1),...measure('refK','refA','OL',5),
 ...measure('A','K','0.02 V',9),...measure('K','A','0.02 V',13),
 {text:'Interpreta las cuatro lecturas y registra el diagnóstico.',tool:'inspect',target:'short',effect:'diagnose',choices:{short:'Diodo en cortocircuito',open:'Diodo abierto',healthy:'Diodo correcto'}},
 {text:'Sustituye el módulo aislado con Repuesto.',tool:'spare',target:'module',effect:'replace'},
 ...measure('A','K','0.57 V',19),...measure('K','A','OL',23),
 {text:'Valida el diodo nuevo: conduce en directa y bloquea en inversa.',tool:'test',target:'measure',effect:'technicalDone',reading:'Diodo verificado · 0.57 V / OL'}]},
 insulation:{title:'Técnica · Comparación de aislamiento',part:'transformer',asset129:true,summary:'Compara dos ramales aislados mediante un megóhmetro virtual. El criterio del ejercicio es una comparación de lecturas, no un límite normativo ni una tensión de ensayo real.',targets:{dial:'Selector · aislamiento virtual',lineA:'Ramal A · LINE',lineB:'Ramal B · LINE',earth:'Terminal EARTH de ensayo',measure:'MEDIR',release:'Retirar puntas',sample:'Muestra aislante extraíble'},steps:[
 {text:'Selecciona el modo de aislamiento del instrumento virtual.',tool:'inspect',target:'dial',effect:'mode'},
 ...measure('lineA','earth','620 MΩ',1),...measure('lineB','earth','18 MΩ',5),
 {text:'Compara ambos ramales. ¿Cuál necesita investigación en este escenario?',tool:'inspect',target:'lowB',effect:'diagnose',choices:{lowB:'Ramal B: resistencia mucho menor',lowA:'Ramal A: resistencia mucho menor',equal:'Ambos tienen la misma lectura'}},
 {text:'Selecciona Repuesto y cambia la muestra aislante del banco.',tool:'spare',target:'sample',effect:'replace'},
 ...measure('lineB','earth','610 MΩ',11),
 {text:'Registra la recuperación de la muestra. El criterio real depende del equipo y del fabricante.',tool:'test',target:'measure',effect:'technicalDone',reading:'Comparación final · A 620 / B 610 MΩ'}]},
 relay:{title:'Técnica · Relé auxiliar y contactos',part:'control',asset129:true,summary:'Diagnostica una bobina abierta en un relé didáctico de 24 V CD. Comprueba bobina, contacto normalmente abierto y respuesta a la señal de prueba; no ajusta protecciones del Metro.',targets:{dial:'Selector · resistencia / continuidad',A1:'Bobina A1',A2:'Bobina A2',C:'Contacto común C',NO:'Contacto normalmente abierto NO',measure:'MEDIR',release:'Retirar puntas',relay:'Relé extraíble',command:'Señal de prueba 24 V CD'},steps:[
 {text:'Selecciona resistencia / continuidad en el instrumento.',tool:'inspect',target:'dial',effect:'mode'},
 ...measure('A1','A2','OL',1),
 {text:'Identifica el resultado de la medición de bobina.',tool:'inspect',target:'coilOpen',effect:'diagnose',choices:{coilOpen:'Bobina abierta',coilGood:'Bobina correcta',coilShort:'Bobina en cortocircuito'}},
 {text:'Con las puntas retiradas, sustituye el relé de práctica.',tool:'spare',target:'relay',effect:'replace'},
 ...measure('A1','A2','960 Ω',7),...measure('C','NO','OL',11),
 {text:'Aplica la señal virtual de prueba a la bobina de 24 V CD.',tool:'test',target:'command',effect:'command',reading:'Señal aplicada · relé activado'},
 ...measure('C','NO','0.2 Ω',16),
 {text:'Finaliza la prueba y retira la señal virtual.',tool:'test',target:'command',effect:'technicalDone',reading:'Relé verificado · contacto abre / cierra'}]}
};
