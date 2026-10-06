import { renderSpatialWav } from './offline-render.js?v=20261006-room-01';
self.onmessage = ({data}) => {
  try {
    const {channels,sampleRate,direction,distance,format,bypassed} = data;
    const buffer={sampleRate,length:channels[0].length,numberOfChannels:channels.length,getChannelData:c=>channels[c]};
    const wav=renderSpatialWav(buffer,direction,distance,format,bypassed);
    self.postMessage({wav},[wav]);
  } catch(error) { self.postMessage({error:error.message || String(error)}); }
};
