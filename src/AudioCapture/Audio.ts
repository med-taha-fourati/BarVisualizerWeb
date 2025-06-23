const FFT_SIZE = 512;

let dataArray: Float32Array | null = null
let analyser: AnalyserNode | null = null;

async function getAudioStream(): Promise<MediaStream> {
    //console.log(navigator.mediaDevices);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            //const constraints = await navigator.mediaDevices.getSupportedConstraints();
            //console.log("i have been accessed", constraints);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    sampleRate: 48000
                },
                video: false
            });
            return stream;
        } catch (err) {
            throw new Error('Failed to capture audio from speaker: ' + (err as Error).message);
        }
    } else {
        throw new Error('getDisplayMedia is not supported in this browser.');
    }
}

async function getFFTData(stream: MediaStream, fftSize: number = FFT_SIZE): Promise<Float32Array> {
    const audioContext = new window.AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = fftSize;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    await new Promise(resolve => setTimeout(resolve, 100));

    analyser.getFloatFrequencyData(dataArray);

    return dataArray;
}

export async function initAudioAnalyser(fftSize: number = FFT_SIZE): Promise<AnalyserNode> {
    const stream = await getAudioStream();
    const audioContext = new window.AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = fftSize;
    source.connect(analyser);

    dataArray = new Float32Array(analyser.frequencyBinCount);

    return analyser;
}

export function getCurrentFFTData(): Float32Array {
    if (!analyser || !dataArray) {
        throw new Error('Audio analyser is not initialized.');
    }
    analyser.getFloatFrequencyData(dataArray);
    return dataArray;
}

export async function getFFTTable(): Promise<Float32Array> {
    const dataStream: MediaStream = await getAudioStream();
    return getFFTData(dataStream, FFT_SIZE);
}