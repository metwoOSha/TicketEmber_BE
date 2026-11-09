export function countRows(seats: { row: number }[]): number {
    return new Set(seats.map((seat) => seat.row)).size;
}
