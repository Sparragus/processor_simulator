// Helper functions
var getBinaryString = function (num, start, end) {
  // TODO: Write function that adds necessary 0 to the left side. In order
  // to substring a num properly it must be at least 16 characters long
  if (typeof num === "number") {
    num = num.toString(2);
    // num = extendZeroes(num, 16);
    return num.substring(num.length - start - 1, num.length - end);
  }
  else if(typeof num === "string") {
		// Parse to int and then change to base 2 num (in string form)
    num = parseInt(num).toString(2);
    return num.substring(num.length - start - 1, num.length - end);
  }
  else {
    return null;
  }
};

// Adds zeroes to the left side of the (binary) string 
// so that the end result is num.length === length
var extendZeroes = function (num, length) {
  if (num.length >= length) {
    return num;
  }
  else {
    while (num.length < length) {
      num = "0" + num;
    }
  }
  return num;
};


var RISC_AR4 = function () {
  var MEM = {
    // Memory has size 256B
    _size: 256,
    _memory: [],

    // Read 8-bit byte from a given address 
    readb: function(addr) { 
      return 0xFF & this._memory[addr];
    },

    // Read 16-bit word from a given address 
    read: function(addr) {
      return (this.readb(addr) << 8) + this.readb(addr+1);
    },

    // Write 8-bit byte to a given address 
    writeb: function(addr, val) {
      this._memory[addr] = 0xFF & val;
    },
    
    // Write 16-bit word to a given address 
    write: function(addr, val) {
      this.writeb(addr, val >> 8);
      this.writeb(addr+1, val);
    },

    reset: function() {
      this._memory = [];

      for (var i = 0; i <= this._size; i++) {
        this._memory[i] = 0;
      }
    }
  };

  var CPU = {
    // Registers
    _r: {r0:0, r1:0, r2:0, r3:0, r4:0, r5:0, r6:0, r7:0, acc:0, pc:0, ir:0, sr:0},
    _regMap: {"000":"r0", "001":"r1", "010":"r2", "011":"r3", "100":"r4", "101":"r5", "110":"r6", "111":"r7"},
    // Flag bit masks
    _f: {Z:8, C:4, N:2, O:1},

    _setFlag: function(flag, value) {
      this._r.sr = (value ? (this._r.sr | this._f[flag]) : (this._r.sr & ~(this._f[flag])));
    },

    _getFlag: function(flag) {
      return ((this._r.sr & this._f[flag]) ? 1 : 0);
    },

    _decode: function (instruction) {
      var opCode = getBinaryString(instruction, 15, 11); 	// return binary string ex. "10010"
      var op = this._opCodeMap[opCode]; 					// returns op name ex. "AND"
      var args = [];


      if (typeof op === undefined) {
        return {op:null, args:null};
      }
      //---- Implicit addressing mode
      else if (op === "NEG" || op === "NOT" || op === "RLC" || op === "RRC" || op === "BRZ" || 
        op === "BRC" || op === "BRN" || op === "BRO" || op === "STOP" || op === "NOP") {
        // Nothing happens. Only acc or sr (implied) is used.
      }
      //---- Immediate addressing mode
      else if (op === "LDI") {
        // Get value from the instruction and parse it for ints into a base 2 number
		// TODO: parseInt wont work. Doesn't do two's complement. ????
        var src = parseInt(getBinaryString(instruction, 7, 0), 2); 

        args.push(src);
      } 	  
	  
      //---- Direct addressing mode
      else if (op === "LDAda" || op === "STAda") {
        // Get address from instruction...
        var address = parseInt(getBinaryString(instruction, 7, 0), 2),
        // ...and fetch value from memory.
			src = MEM.read(address);
			

        args.push(src);
      }
      //---- Register Direct addressing mode
      else if (op === "AND" || op === "OR" || op === "XOR" || op === "ADDC" || op === "SUB" || 
        op === "MAC" || op === "LDA" || op === "STA") {
        // Get register number from the instruction.

        var register = getBinaryString(instruction, 10, 8);
        var src = this._r[ this._regMap[register] ];
        args.push(src);
      }
      
      return {op:op, args:args};

    },

    _execute: {
      AND: function (src) {
        this._r.acc = this._r.acc & src;
        // TODO: Deal with flags
      },

      OR: function (src) {
        this._r.acc = this._r.acc | src;
        // TODO: Deal with flags
      },

      XOR: function (src) {
        this._r.acc = this._r.acc ^ src;
        // TODO: Deal with flags
      },

      ADDC: function (src) {
				// Get num with larger magnitude...
				var larger = ((Math.abs(this._r.acc) >= Math.abs(src)) ? acc : src);
				// ...and extract the sign from it.
				var sign_old = getBinaryString(larger, 7, 7);
				
        this._r.acc = this._r.acc + src;
				
				// Get sign of the new acc. Needed for overflow calculation.
				var sign_new = getBinaryString(this._r.acc, 7, 7);
        // TODO: Deal with flags
				this._setFlag("Z", this._r.acc === 0 ? 1 : 0);
        this._setFlag("C", 0);
        this._setFlag("N", this._r.acc < 0 ? 1 : 0);
        this._setFlag("O", sign_old === sign_new ? 0, 1);
      },

      SUB: function (src) {
        this._r.acc = this._r.acc - src;
        // TODO: Deal with flags
      },

      MAC: function (src) {
        // TODO: Deal with flags
      },

      NEG: function () {
        this._r.acc = -this._r.acc;
        // TODO: Deal with flags
        this._setFlag("Z", this._r.acc === 0 ? 1 : 0);
        this._setFlag("C", 0);
        this._setFlag("N", this._r.acc < 0 ? 1 : 0);
        this._setFlag("O", 0);
      },
      
      NOT: function () {
        this._r.acc = ~this._r.acc;
        // TODO: Deal with flags
        this._setFlag("Z", this._r.acc === 0 ? 1 : 0);
        this._setFlag("C", 0);
        this._setFlag("N", this._r.acc < 0 ? 1 : 0);
        this._setFlag("O", 0);
      },

      RLC: function () {
        // TODO: Deal with flags
      },

      RRC: function () {
        // TODO: Deal with flags
      },

      LDAda: function (src) {
        // TODO: Deal with flags
      },

      STAda: function (src) {
        // TODO: Deal with flags
      },

      LDA: function (src) {
        // TODO: Deal with flags
      },

      STA: function (src) {
        // TODO: Deal with flags
      },

      LDI: function (src) {
        // TODO: Deal with flags
      },

      BRZ: function () {
        // TODO: Deal with flags
      },

      BRC: function () {
        // TODO: Deal with flags
      },

      BRN: function () {
        // TODO: Deal with flags
      },

      BRO: function () {
        // TODO: Deal with flags
      },

      STOP: function () {
        // TODO: Deal with flags
      },

      NOP: function () {
        // TODO: Deal with flags
      }
    },

    _opCodeMap: {
      "00000" : "AND",
      "00001" : "OR",
      "00010" : "XOR",
      "00011" : "ADDC",
      "00100" : "SUB",
      "00101" : "MAC",
      "00110" : "NEG",
      "00111" : "NOT",
      "01000" : "RLC",
      "01001" : "RRC",
      "01010" : "LDA",
      "01011" : "STA",
      "01100" : "LDAda", // TODO: Ask Nayda about this name collision
      "01101" : "STAda",
      "01110" : "LDI",
      // Missing 01111
      "10000" : "BRZ",
      "10001" : "BRC",
      "10010" : "BRN",
      "10011" : "BRO",
      // Missing
      "11000" : "NOP",
      // Missing
      "11111" : "STOP"
    },

    stop: function() {
      // Stop the machine
    },

    performCycle: function() {
      var instruction = MEM.read(this._r.pc);
      var decodedInstruction = this._decode(instruction); // {op:opCode, args:args}
			this._r.pc += 2;

      if (decodedInstruction.op !== null && decodedInstruction.args !== null) {
        this._execute[decodedInstruction.op].apply(this, decodedInstruction.args);
      } 
			else {
        this.stop();
        throw new Error("undefined operation code or wrongly defined arguments");
      }
    }
  };

  return {MEM : MEM, CPU : CPU};
};

(function(){
  var arch = RISC_AR4();

  //---- Load program
  // TODO: Load program func
  // Address: 0x00 Instruction: AND r0
  arch.MEM.write(0x00, 0x0000);
  arch.CPU._r["r0"]  = parseInt('10011001', 2) // 153
  arch.CPU._r["acc"] = parseInt('10100101', 2) // 165


  // TODO: Why are both arch.CPU._r equal???? PC = 2 in both!?
  // http://stackoverflow.com/questions/4057440/is-chromes-javascript-console-lazy-about-evaluating-arrays

  console.log("==================================");
  console.log("Cycle started");
  console.log("");
  console.log("Old Status:");
  
  console.log(arch.CPU._r);
  
  console.log("");
  
  setTimeout(function(){
    arch.CPU.performCycle();

    console.log("");
    console.log("New Status:");
	
    console.log(arch.CPU._r);
    
	console.log("==================================");
    }, 1000);
  
})();   