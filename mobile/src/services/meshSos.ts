export interface MeshRelayPacket {
  packetId: string;
  originDeviceId: string;
  hopCount: number;
  relayNodesCount: number;
  signalStrengthDbm: number;
  latitude: number;
  longitude: number;
  status: 'BROADCASTING' | 'RELAYED_SUCCESS' | 'DISPATCHED_TO_RESCUE';
  timestamp: string;
  message: string;
}

class BleMeshSosNetwork {
  private isBroadcasting: boolean = false;
  private currentPacket: MeshRelayPacket | null = null;
  private listeners: Array<(packet: MeshRelayPacket) => void> = [];

  public startMeshBroadcast(
    customMessage: string = 'SOS: Cần cứu hộ khẩn cấp tại vị trí gần nhất!',
    lat: number = 10.7769,
    lng: number = 106.7009,
  ): MeshRelayPacket {
    this.isBroadcasting = true;

    const packet: MeshRelayPacket = {
      packetId: `BLE_MESH_${Date.now().toString(36).toUpperCase()}`,
      originDeviceId: `MILO_NODE_${Math.floor(1000 + Math.random() * 9000)}`,
      hopCount: 3,
      relayNodesCount: 4, // 4 intermediate rescue nodes
      signalStrengthDbm: -58, // Strong close BLE proximity
      latitude: lat,
      longitude: lng,
      status: 'BROADCASTING',
      timestamp: new Date().toLocaleTimeString(),
      message: customMessage,
    };

    this.currentPacket = packet;
    this.notifyListeners(packet);

    // Simulate hop-by-hop relay propagation
    setTimeout(() => {
      if (this.currentPacket) {
        this.currentPacket.status = 'RELAYED_SUCCESS';
        this.notifyListeners(this.currentPacket);
      }
    }, 1800);

    return packet;
  }

  public stopMeshBroadcast() {
    this.isBroadcasting = false;
    this.currentPacket = null;
  }

  public getCurrentPacket(): MeshRelayPacket | null {
    return this.currentPacket;
  }

  public subscribe(listener: (packet: MeshRelayPacket) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(packet: MeshRelayPacket) {
    this.listeners.forEach((l) => l(packet));
  }
}

export const bleMeshSos = new BleMeshSosNetwork();
