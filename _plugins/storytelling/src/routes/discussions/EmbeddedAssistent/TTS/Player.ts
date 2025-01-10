// import EmitterSingleton from "@/utils/Emitter";

export default class ChunkedAudioPlayer {

    private audioContext: AudioContext;
    private chunkQueue: ArrayBuffer[] = [];
    private isPlaying = false;
    private chunksReceived = 0;
    private analyser: AnalyserNode;
    private dataArray: Uint8Array;
    private shouldMonitorLoudness = true;
    // private emitter = EmitterSingleton;
    private isMonitoring = false;
    private handle = 0;
    private volume = 1.0;
    private loudnessCallback: (value: number) => void = () => { };
    private currentIndex = 0;

    constructor() {
        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256; // Set the FFT size (smaller values provide faster updates, larger ones give better resolution)
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength); // Array to hold frequency data

        // this.emitter.on('enableAudio', (enable: boolean) => {
        //     this.volume = enable ? 1.0 : 0.0;
        // });
    }

    public setOnLoudnessChange(callback: (value: number) => void) {
        this.loudnessCallback = callback;
    }

    public async addChunk(chunk: ArrayBuffer, position: number): Promise<void> {
        // console.log('Adding chunk', chunk);
        this.chunkQueue[position] = chunk; // changed from push to positional storage
        this.chunksReceived++;
        // console.log("received chunk", {
        //     chunksReceived: this.chunksReceived,
        //     chunkQueue: this.chunkQueue.length,
        //     isPlaying: this.isPlaying,
        // })

        if (!this.isPlaying && position === this.currentIndex) {
            this.playChunks();
        }
    }

    private playChunks(): void {
        // console.log({ isPlaying: this.isPlaying });
        if (this.isPlaying) return;
        if (!this.chunkQueue[this.currentIndex]) {
            return; // wait until the correct chunk arrives
        }
        this.isPlaying = true;
        this.playChunk(this.chunkQueue[this.currentIndex]).then(() => {
            this.isPlaying = false;
            this.currentIndex++;
            if (this.chunkQueue[this.currentIndex]) {
                this.playChunks();
            } else {
                this.shouldMonitorLoudness = false;
            }
        });
    }

    public stopPlayback(): void {
        // Implement logic to stop the current playback
        this.isPlaying = false;
        this.chunkQueue = [];
        this.shouldMonitorLoudness = false;
        cancelAnimationFrame(this.handle);
    }

    private playChunk(chunk: ArrayBuffer): Promise<void> {
        // console.log('Playing chunk', chunk);
        return new Promise((resolve) => {
            const source = this.audioContext.createBufferSource();
            this.audioContext.decodeAudioData(chunk.slice(0)).then((audioBuffer) => {
                source.buffer = audioBuffer;

                // Create a GainNode for volume control
                const gainNode = this.audioContext.createGain();
                gainNode.gain.value = this.volume;

                // Connect the source to the GainNode, then to the analyser node, then to the destination (speakers)
                source.connect(gainNode);
                gainNode.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);

                source.start(0);
                // this.emitter.on('enableAudio', (enable: boolean) => {
                // gainNode.gain.value = enable ? 1.0 : 0.0;
                // });

                source.onended = () => {
                    resolve();
                };

                // Start monitoring loudness only once
                if (!this.isMonitoring) {
                    this.isMonitoring = true;
                    this.monitorLoudness();
                }
            });
        });
    }

    async playAgain(): Promise<void> {
        console.log('Playing again');
        if (this.chunkQueue.length > 0 && !this.isPlaying) {
            this.playChunks();
        }
    }

    private monitorLoudness(): void {
        // Stop monitoring when the flag is false
        if (!this.shouldMonitorLoudness) {
            console.log('Loudness monitoring stopped.');
            cancelAnimationFrame(this.handle);
            // this.emitter.emit('loudness', 0);
            return;
        }

        // Get the time domain data from the analyser (this is a snapshot of the waveform)
        this.analyser.getByteTimeDomainData(this.dataArray);

        // Calculate the RMS (root mean square) of the waveform values to get the perceived loudness
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            const value = this.dataArray[i] / 128.0 - 1.0; // Normalize between -1 and 1
            sum += value * value;
        }

        const rms = Math.sqrt(sum / this.dataArray.length);

        // Handle the case where RMS is 0 to avoid log10(0)
        if (rms === 0) {
            console.log('Current loudness: Silent');
        } else {
            let loudnessInDb = 20 * Math.log10(rms); // Convert to dB
            // console.log('Current loudness:' + loudnessInDb);
            const minDb = -57;
            const maxDb = -15;

            if (loudnessInDb < minDb) {
                loudnessInDb = minDb;
            }
            if (loudnessInDb > maxDb) {
                loudnessInDb = maxDb;
            }

            const loudnessScale = ((loudnessInDb - minDb) / (maxDb - minDb)) * 100;

            this.loudnessCallback(loudnessScale);
        }

        // Call this method again at regular intervals if you want continuous loudness monitoring
        this.handle = requestAnimationFrame(() => this.monitorLoudness());
    }
}