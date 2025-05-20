/**
 * Build a framed Eagle Bluetooth packet.
 *
 * @param bits  A list of 0/1 values, **LSB-first**, that make up the payload.
 *              Example: [1,0,1] encodes to byte 0b00000101.
 * @returns     Number array: 0xFF starter, 109-byte payload, 8-bit checksum.
 */
export const buildPacket = (bits: number[]): Array<number> => {
    const PACKET_SIZE = 109
    const PAYLOAD_BITS = PACKET_SIZE * 8
    const STARTER_BYTE = 0xFF

    if (bits.length > PAYLOAD_BITS) {
        throw new RangeError(`payload would overflow (${bits.length} > ${PAYLOAD_BITS} bits)`)
    }

    // pack bits into bytes (LSB-first)
    const packetBytes = new Array<number>(PACKET_SIZE).fill(0)
    bits.forEach((bit, idx) => {
        if (bit & 1) packetBytes[idx >> 3] |= 1 << (idx & 7)
    })

    // Calculate the checksum
    let checksum = 0
    for (let i = 0; i < packetBytes.length; i++) {
        checksum += packetBytes[i]
    }
    checksum = checksum & 0xFF

    // Return the full packet: 0xFF + payload + checksum
    return [STARTER_BYTE, ...packetBytes, checksum]
}
