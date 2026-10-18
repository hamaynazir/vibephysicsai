// Presentation stages are deliberately slowed; never a calibrated transport solution.
export const sequences={
 statistics:['Radiation approaches','Interaction in detector','Electrical pulse travels','Scaler registers pulse'],
 voltage:['Gamma approaches crystal','Energy deposited → light','Photocathode → electrons','Dynode multiplication','Threshold decision'],
 calibration:['Known gamma approaches','Interaction → detector pulse','Pulse height is analyzed','Pulse assigned to a channel'],
 electronics:['Detector produces a pulse','Preamplifier response','Amplification and shaping','SCA decision → logic output'],
 efficiency:['Emission in many directions','Some rays miss the window','Some reach the active window','Only a fraction are detected']
};
export function sequenceAt(id,time){const labels=sequences[id];const phase=((time%8)+8)%8/8,position=phase*labels.length,index=Math.floor(position);return {phase,index,progress:position-index,label:labels[index],labels};}
export const gmStages=['Beta particle approaches','Ionization in gas','Electrons drift inward','Avalanche → electrical pulse','Positive-ion recovery'];
export function gmPhase(progress){const p=Math.min(.999999,Math.max(0,progress)),index=Math.floor(p*5);return {index,local:p*5-index,label:gmStages[index]};}
