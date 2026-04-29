function convolveArrays(die1, die2) {
        let result = [];
        // Iterate through the first array
        for (let i = 0; i < die1.length; i++) {
            // For each element in the first array, iterate through the second array
            for (let j = 0; j < die2.length; j++) {
                // If the index exists in the result array, add the product; otherwise, initialize it
                if (i + j < result.length) {
                    result[i + j] += die1[i] * die2[j];
                } else {
                    result.push(die1[i] * die2[j]);
                }
            }
        }
        return result;
    }
    
    function sum(arr) {
        return arr.reduce((acc, val) => acc + val, 0);
    }

    function roundToNearestBreakpoint(num, breakpoints) {
        return breakpoints.reduce((prev, curr) => {
            return (Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev);
        });
    }

    function formatOdds(odds) {

        let whole = Math.trunc(odds);
        let frac = +((odds - whole).toFixed(2));
        switch (frac) {
            case 0:
                return `${odds}:1`; 
            case 0.25:
                return `${Math.round(odds*4)}:4`;
            case 0.33:
                return `${Math.round(odds*3)}:3`;
            case 0.5:
                return `${Math.round(odds*2)}:2`;
            case 0.67: 
                return `${Math.round(odds*3)}:3`;

            case 0.75:
                return `${Math.round(odds*4)}:4`;
            default:
                return `${odds}:1`;
        }
    }
