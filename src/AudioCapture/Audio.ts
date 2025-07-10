export const FFT_SIZE = 2048;
export const BAR_COUNT = 64;

let stream: MediaStream | null = null;

export const bands = (sampleRate: number, barCount: number = BAR_COUNT) => {
    const halvedSampleRate = sampleRate / 2;
    const bandCount = barCount;
    const bandWidth = halvedSampleRate / bandCount;
    return Array.from({ length: bandCount }, (_, i) => ({
        start: i * bandWidth,
        end: (i + 1) * bandWidth
    }));
}

export const logarithmicBands = (sampleRate: number, barCount: number = BAR_COUNT) => {
    const halvedSampleRate = sampleRate / 2;
    const bandCount = barCount;
    const bandWidth = halvedSampleRate / bandCount;
    return Array.from({ length: bandCount }, (_, i) => {
        const start = Math.pow(bandCount, i / bandCount) * bandWidth;
        const end = Math.pow(bandCount, (i + 1) / bandCount) * bandWidth;
        return { start, end };
    });
}

export const STFTBands = (maxFreq: number, barCount: number = BAR_COUNT): { start: number, end: number }[] => {
    // const halvedSampleRate = sampleRate / 2;
    // const bandCount = barCount;
    // const bandWidth = halvedSampleRate / bandCount;
    // const constantWidth: number[] = [];
    // let i = 0;
    // for (let j = bandWidth; j <= halvedSampleRate; j += bandWidth) {
    //     constantWidth[i] = j;
    //     i++; // this works
    // }

    // const resultArray: { start: number, end: number } [] = [];
    // constantWidth.forEach((item) => {
    //     const result = Array.from({ length: item }, (_, i) => {
    //         const start = Math.pow(item, i / item) * bandWidth;
    //         const end = Math.pow(item, i / item) * bandWidth;
    //         return { start, end };
    //     });
    //     result.forEach((e) => {resultArray.push(e)});
    // });
    const resultArray: { start: number, end: number }[] = [];
    const minL = Math.log10(20);
    const maxL = Math.log10(maxFreq / 2);
    const step = (maxL - minL) / barCount;

    for (let i = 0; i < barCount; i++) {
        const start = Math.pow(10, minL + i * step);
        const end = Math.pow(10, minL + (i + 1) * step);
        resultArray.push({ start, end });
    }
    return resultArray;
};

let dataArray: Float32Array | null = null
let analyser: AnalyserNode | null = null;

async function getAudioStream(): Promise<MediaStream> {
    //console.log(navigator.mediaDevices);
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        try {
            //const constraints = await navigator.mediaDevices.getSupportedConstraints();
            //console.log("i have been accessed", constraints);
            const stream = await navigator.mediaDevices.getDisplayMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    sampleRate: 48000
                },
                video: true
            });
            return stream;
        } catch (err) {
            throw new Error('Failed to capture audio from speaker: ' + (err as Error).message);
        }
    } else {
        throw new Error('getDisplayMedia is not supported in this browser.');
    }
}

//NOTE: this initializes the audio fft analyzer
export async function initAudioAnalyser(fftSize: number = FFT_SIZE): Promise<AnalyserNode> {
    if (stream === null) {
        stream = await getAudioStream();
    }
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

export const getBandEnergies = (
    fftData: Float32Array,
    bands: {start: number, end: number}[],
    sampleRate: number,
    fftSize: number
) => {
    return bands.map(({start: fLow, end: fHigh}) => {
        const binLow = Math.floor(fLow * fftSize / sampleRate);
        const binHigh = Math.min(Math.ceil(fHigh * fftSize / sampleRate), fftData.length - 1);
        let sum = 0, count = 0;
        for (let i = binLow; i <= binHigh; i++) {
            sum += fftData[i];
            count++;
        }
        return count > 0 ? sum / count : 0;
    });
}

//TODO: make the fft logarithmic
