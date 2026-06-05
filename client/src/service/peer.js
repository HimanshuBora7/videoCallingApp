class PeerService {
  constructor() {
    this.peer = null;
    this.pendingCandidates = [];
    this.createPeer();
  }

  createPeer() {
    if (this.peer) {
      this.peer.close();
    }
    this.pendingCandidates = [];
    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });
  }

  resetPeer() {
    this.createPeer();
  }

  async waitForIceGathering() {
    if (this.peer.iceGatheringState === "complete") return;
    await new Promise((resolve) => {
      const check = () => {
        if (this.peer.iceGatheringState === "complete") {
          this.peer.removeEventListener("icegatheringstatechange", check);
          resolve();
        }
      };
      this.peer.addEventListener("icegatheringstatechange", check);
    });
  }

  async getOffer() {
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(new RTCSessionDescription(offer));
    await this.waitForIceGathering();
    return this.peer.localDescription;
  }

  async getAnswer(offer) {
    await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
    await this.flushPendingCandidates();
    const ans = await this.peer.createAnswer();
    await this.peer.setLocalDescription(new RTCSessionDescription(ans));
    await this.waitForIceGathering();
    return this.peer.localDescription;
  }

  async setRemoteDescription(ans) {
    await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    await this.flushPendingCandidates();
  }

  async flushPendingCandidates() {
    for (const candidate of this.pendingCandidates) {
      await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
    this.pendingCandidates = [];
  }

  async addIceCandidate(candidate) {
    if (!candidate) return;
    if (this.peer.remoteDescription) {
      await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      this.pendingCandidates.push(candidate);
    }
  }
}

export default new PeerService();
