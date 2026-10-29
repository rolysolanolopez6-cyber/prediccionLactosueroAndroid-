(function(){
  'use strict';
  const M = window.LACTOSUERO_MODEL;
  const $ = id => document.getElementById(id);
  const fmt = (v,d=2) => Number(v).toLocaleString('es-PE',{minimumFractionDigits:d,maximumFractionDigits:d});
  const meta=M.metadata;
  const dateInput=$('fecha');
  const today=new Date();
  dateInput.value=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
  const productSelect=$('tipo_producto');
  M.metadata.productos.forEach(p=>{const o=document.createElement('option');o.value=p;o.textContent=p.replaceAll('_',' ');productSelect.appendChild(o);});
  $('model-info').textContent=`Registros válidos: ${meta.registros_validos}. Periodo histórico: ${meta.fecha_desde} a ${meta.fecha_hasta}. El conjunto es sintético; valida el modelo con datos reales antes de tomar decisiones operativas.`;
  function transform(input){
    const out=[];
    M.numeric_features.forEach((name,i)=>{
      let v=input[name];
      if(v===null||v===undefined||!Number.isFinite(Number(v)))v=M.numeric_medians[i];
      out.push((Number(v)-M.numeric_means[i])/M.numeric_scales[i]);
    });
    M.categorical_features.forEach((name,i)=>{
      const cats=M.categories[i];
      const val=String(input[name]??'');
      cats.forEach(c=>out.push(c===val?1:0));
    });
    return out;
  }
  function predictVector(x){
    if(M.model_type==='Bosque aleatorio'){
      let sum=0;
      for(const t of M.trees){
        let node=0, guard=0;
        while(t.left[node]!==-1 && guard++<10000){
          const fi=t.feature[node];
          node=(Math.fround(x[fi]) <= t.threshold[node]) ? t.left[node] : t.right[node];
        }
        sum+=t.value[node];
      }
      return Math.max(0,sum/M.trees.length);
    }
    let y=M.intercept;
    for(let i=0;i<M.coefficients.length;i++)y+=M.coefficients[i]*x[i];
    return Math.max(0,y);
  }
  $('prediction-form').addEventListener('submit',function(ev){
    ev.preventDefault();
    const dateText=$('fecha').value;
    if(!dateText){alert('Selecciona la fecha del lote.');return;}
    const d=new Date(dateText+'T12:00:00');
    if(Number.isNaN(d.getTime())){alert('La fecha no es válida.');return;}
    const start=new Date(d.getFullYear(),0,0);
    const dayOfYear=Math.floor((d-start)/86400000);
    const input={
      mes:d.getMonth()+1, tipo_producto:productSelect.value,
      volumen_leche_L:Number($('volumen_leche_L').value),
      grasa_leche_pct:Number($('grasa_leche_pct').value),
      proteina_leche_pct:Number($('proteina_leche_pct').value),
      solidos_totales_pct:Number($('solidos_totales_pct').value),
      temperatura_proceso_C:Number($('temperatura_proceso_C').value),
      rendimiento_historico_movil_pct:Number($('rendimiento_historico_movil_pct').value),
      agua_limpieza_L:Number($('agua_limpieza_L').value),
      anio:d.getFullYear(),dia_del_anio:dayOfYear,dia_semana:(d.getDay()+6)%7
    };
    for(const [k,v] of Object.entries(input)){
      if(typeof v==='number'&&!Number.isFinite(v)){alert('Revisa los campos numéricos.');return;}
      if(typeof v==='number'&&v<0&&k!=='temperatura_proceso_C'){alert('Los volúmenes, porcentajes e indicadores no pueden ser negativos.');return;}
    }
    if(input.mes<1||input.mes>12){alert('El mes debe estar entre 1 y 12.');return;}
    if(input.grasa_leche_pct>100||input.proteina_leche_pct>100||input.solidos_totales_pct>100||input.rendimiento_historico_movil_pct>100){alert('Los porcentajes deben estar entre 0 y 100.');return;}
    const pred=predictVector(transform(input));
    $('prediction').textContent=fmt(pred)+' L';
    $('model-name').textContent='Modelo seleccionado: '+meta.modelo_seleccionado;
    $('mape-valid').textContent=fmt(meta.mape_validacion_pct)+'%';
    $('mape-test').textContent=fmt(meta.mape_prueba_pct)+'%';
    $('r2-test').textContent=fmt(meta.r2_prueba,3);
    $('threshold-message').textContent=meta.mape_prueba_pct<=meta.umbral_mape_pct?'MAPE de prueba dentro del umbral configurado ('+fmt(meta.umbral_mape_pct)+'%).':'MAPE de prueba por encima del umbral configurado ('+fmt(meta.umbral_mape_pct)+'%); revisar datos, variables y modelo.';
    $('result').classList.add('show');
    $('result').scrollIntoView({behavior:'smooth',block:'start'});
  });
})();