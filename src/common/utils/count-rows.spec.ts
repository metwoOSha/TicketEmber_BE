import { describe, it, expect } from 'vitest';
import { countRows } from './count-rows.js';

type RowSeat = { row: number };

function makeSeats(rows: number, seatsPerRow: number): RowSeat[] {
    const seats: RowSeat[] = [];

    for (let row = 1; row <= rows; row++) {
        for (let i = 0; i < seatsPerRow; i++) {
            seats.push({ row });
        }
    }

    return seats;
}

describe('countRows', () => {
    it('returns 0 for an empty array', () => {
        const seats = makeSeats(0, 0);

        expect(countRows(seats)).toBe(0);
    });

    it('returns 1 when all seats are in one row', () => {
        const seats = makeSeats(1, 5);

        expect(countRows(seats)).toBe(1);
    });

    it('counts each row once', () => {
        const seats = makeSeats(12, 18);

        expect(countRows(seats)).toBe(12);
    });
});
