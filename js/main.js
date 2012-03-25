    var mem;
;(function () {

    var readFile = function (evt) {
        mem  = [];
        var f = evt.target.files[0];
        var hexMap = {"0":"0000", "1":"0001", "2":"0010", "3":"0011", "4":"0100", "5":"0101", "6":"0110", "7":"0111", "8":"1000", "9":"1001", "A":"1010", "B":"1011", "C":"1100", "D":"1101", "E":"1110", "F":"1111"};
        if (f) {
          var r = new FileReader();
          r.readAsText(f);
          r.onload = function(e) {
            var j=0;
            var contents = e.target.result;
            s=contents.split('\n');
            for( var i=0; i<s.length-1; i++){
               var first = hexMap[ s[i].charAt(0) ];
               var second = hexMap [ s[i].charAt(1) ];
               var third = hexMap [ s[i].charAt(2) ];
               var fourth = hexMap [ s[i].charAt(3) ];
               mem[j] = first + second;
               mem[++j] = third + fourth;
               j++;
           }

            setTimeout(function(){
                $('#runlink').click();
            }, 500);

            //return mem;
          }

        } else {
          alert("Failed to load file");
        }
    };

    var updateMemoryDisplay = function (arch) {
       //arch.MEM._memory.forEach(createHTMLForMemory);
        var htmlStr;
        var tbody = $('table#memory-table tbody');
        tbody.empty();
        arch.MEM._memory.forEach( function (element, index, array) {
            htmlStr = "<tr><td>" + index.toString(16).toUpperCase() + "</td><td>" + element.toString(16).toUpperCase()+"</td></tr>";
            tbody.append(htmlStr);
        });
    };

    var update =  function(computer) {
        // Update Memory
        updateMemoryDisplay(computer);
        // Program Counter
        $('div#program_counter pre').text(extendZeroes(computer.CPU._r['pc'].toString(2),8));
        // Instruction Register
        $('div#instruction_register pre').text(extendZeroes(computer.CPU._r['ir'].toString(2), 16));
        // Keyboard
        //$('div#keyboard pre').text(computer.CPU._r['pc']);
        // Display
        //$('div#display pre').text(computer.CPU._r['pc']);
        // Accumulator
        $('div#accumulator pre').text(extendZeroes(computer.CPU._r['acc'].toString(2),8));
        // ZNCO Flags
        $('div#zero_flag pre').text(computer.CPU._getFlag('Z'));
        $('div#negative_flag pre').text(computer.CPU._getFlag('N'));
        $('div#carry_flag pre').text(computer.CPU._getFlag('C'));
        $('div#overflow_flag pre').text(computer.CPU._getFlag('O'));
        // Registers
        $('div#register_0 pre').text(extendZeroes(computer.CPU._r['r0'].toString(2),8));
        $('div#register_1 pre').text(extendZeroes(computer.CPU._r['r1'].toString(2),8));
        $('div#register_2 pre').text(extendZeroes(computer.CPU._r['r2'].toString(2),8));
        $('div#register_3 pre').text(extendZeroes(computer.CPU._r['r3'].toString(2),8));
        $('div#register_4 pre').text(extendZeroes(computer.CPU._r['r4'].toString(2),8));
        $('div#register_5 pre').text(extendZeroes(computer.CPU._r['r5'].toString(2),8));
        $('div#register_6 pre').text(extendZeroes(computer.CPU._r['r6'].toString(2),8));
        $('div#register_7 pre').text(extendZeroes(computer.CPU._r['r7'].toString(2),8));
    };

    var startCPU = function(program) {
        var arch = RISC_AR4();
        arch.MEM.reset();
        for(var i=0; i<program.length; i++){
            arch.MEM.writeb(i, binStringToInt(program[i]));
	}

        return arch;
    };

    var runCPU = function(computer) {
        computer.CPU.performCycle();
        update(computer)
        //console.log("Computer: ", computer);
    };

    var onClickRun = function() {
        var running = false;
        var intervalId = 0;
        return function() {
            //Stopped, Change to Run.
            if (!running) {
                // Toggle
                running = !running;
                // Set button to Stop
                $('button#run_button')
                    .children('i')
                        .removeClass("icon-play")
                        .addClass("icon-stop")
                        .end()
                    .children('span')
                        .text('Stop');

                intervalId = window.setInterval( function() {
                    //console.log("Running...")
                    runCPU(computer);
                    console.log(computer);
                }, 1000);

            }
            //Running, Change to Stop
            else {
                // Toggle
                running = !running;
                // Set button to Stop
                $('button#run_button')
                    .children('i')
                        .removeClass("icon-stop")
                        .addClass("icon-play")
                        .end()
                    .children('span')
                        .text('Run');

                clearInterval(intervalId);
                console.log("Stopped");
            }
        };
    };

    var onClickStep = function() {
        console.log("Step");
    };

    var computer;
    var hello = function() {
        setTimeout(function () {
            var program = mem;
            computer = startCPU(program);
            updateMemoryDisplay(computer);
            $('button#run_button').on('click', onClickRun());
        }, 1000);
    };
    document.getElementById('fileinput').addEventListener('change', readFile, false);
    document.getElementById('fileinput').addEventListener('change', hello, false);

}());
