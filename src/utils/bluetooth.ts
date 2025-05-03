/**
 * Returns a bluetooth packet with a checksum.
 * @param packetString
 */
export const buildPacket = (payload: string): Array<number> => {
    const PACKET_SIZE = 128
    const STARTER_BYTE = 0xFF
    const PADDING_CHAR = '-'

    // Pad the packet string to the required size
    const paddedPacket = payload.padEnd(PACKET_SIZE, PADDING_CHAR)

    // Convert the string to ASCII codes
    const packetBytes = Array.from(paddedPacket).map(char => char.charCodeAt(0))

    // Calculate the checksum
    let checksum = 0
    for (let i = 0; i < packetBytes.length; i++) {
        checksum += packetBytes[i]
    }
    checksum = checksum & 0xFF

    // Return the full packet: 0xFF + payload + checksum
    return [STARTER_BYTE, ...packetBytes, checksum]
}
