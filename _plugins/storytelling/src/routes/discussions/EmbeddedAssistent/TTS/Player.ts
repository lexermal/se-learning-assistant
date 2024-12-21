// import EmitterSingleton from "@/utils/Emitter";

export default class ChunkedAudioPlayer {

    private audioContext: AudioContext;
    private chunkQueue: ArrayBufferLike[] = [];
    private combinedChunks: AudioBuffer[] = [];
    private chunkSplit: number[] = [];
    private currentChunkIndex = 0;
    private isPlaying = false;
    private chunksReceived = 0;
    private analyser: AnalyserNode;
    private dataArray: Uint8Array;
    private shouldMonitorLoudness = true;
    // private emitter = EmitterSingleton;
    private isMonitoring = false;
    private handle = 0;
    private volume = 1.0;

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

    async addChunk(chunk: ArrayBufferLike, chunkSplit: number[]): Promise<void> {
        this.chunkQueue.push(chunk);
        this.chunkSplit = chunkSplit;
        this.chunksReceived++;

        if (this.chunkQueue.length >= this.chunkSplit[this.currentChunkIndex]) {
            const combinedBuffer = await this.combineChunks();
            this.combinedChunks.push(combinedBuffer);
            this.currentChunkIndex++;
            if (!this.isPlaying && this.chunksReceived >= 5) {
                this.playChunks();
            }
        }
    }

    private async combineChunks(): Promise<AudioBuffer> {
        const chunksToCombine = this.chunkQueue.splice(0, this.chunkSplit[this.currentChunkIndex]);
        const combinedBuffer = this.concatenateArrayBuffers(chunksToCombine);
        const audioBuffer = await this.audioContext.decodeAudioData(combinedBuffer.slice(0));
        return audioBuffer;
    }

    private playChunks(): void {
        if (this.combinedChunks.length > 0 && !this.isPlaying) {
            console.log('Playing chunk ' + this.combinedChunks.length);
            this.isPlaying = true;

            this.playChunk(this.combinedChunks.shift()!).then(() => {
                this.isPlaying = false;
                if (this.combinedChunks.length > 0) {
                    this.playChunks();
                } else {
                    // Stop loudness monitoring when all chunks are done
                    this.shouldMonitorLoudness = false;
                }
            });
        }
    }


    private playChunk(chunk: AudioBuffer): Promise<void> {
        return new Promise((resolve) => {
            const source = this.audioContext.createBufferSource();
            source.buffer = chunk;

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
    }

    private concatenateArrayBuffers(buffers: ArrayBufferLike[]): ArrayBuffer {
        let totalLength = 0;
        for (const buffer of buffers) {
            totalLength += buffer.byteLength;
        }

        const concatenatedBuffer = new ArrayBuffer(totalLength);
        const dataView = new DataView(concatenatedBuffer);
        let offset = 0;
        for (const buffer of buffers) {
            for (let i = 0; i < buffer.byteLength; i++) {
                dataView.setUint8(offset + i, new Uint8Array(buffer)[i]);
            }
            offset += buffer.byteLength;
        }

        return concatenatedBuffer;
    }

    async endConversation(): Promise<void> {
        console.log('Conversation ended');
        if (this.chunkQueue.length > 0) {
            const combinedBuffer = await this.combineChunks();
            this.combinedChunks.push(combinedBuffer);
            if (!this.isPlaying) {
                this.playChunks();
            }
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

            // this.emitter.emit('loudness', loudnessScale);
        }

        // Call this method again at regular intervals if you want continuous loudness monitoring
        this.handle = requestAnimationFrame(() => this.monitorLoudness());
    }
}