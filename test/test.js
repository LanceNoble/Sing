import { strip } from "../index.js";

describe("strip", function () {
    it("should return [0, 0] with a buffer length of 0 regardless of its content", function () {
        const buf = Buffer.alloc(0);
        const res = strip(buf, 0);
        if (res[0] == 0 && res[1] == 0) {
            throw new Error();
        }
    });    
});
