;(function () {
    var update =  function(computer) {
        // Program Counter
        $('div#program_counter pre').text(computer.CPU._r['pc']);
        // Instruction Register
        $('div#instruction_register pre').text(computer.CPU._r['ir']);
        // Keyboard
        //$('div#keyboard pre').text(computer.CPU._r['pc']);
        // Display
        //$('div#display pre').text(computer.CPU._r['pc']);
        // Accumulator
        $('div#accumulator pre').text(computer.CPU._r['acc']);
        // ZNCO Flags
        $('div#zero_flag pre').text(computer.CPU._getFlag(computer.CPU._f['Z']));
        $('div#negative_flag pre').text(computer.CPU._getFlag(computer.CPU._f['N']));
        $('div#carry_flag pre').text(computer.CPU._getFlag(computer.CPU._f['C']));
        $('div#overflow_flag pre').text(computer.CPU._getFlag(computer.CPU._f['O']));
        // Registers
        $('div#registe_r0 pre').text(computer.CPU._r['r0']);
        $('div#registe_r1 pre').text(computer.CPU._r['r1']);
        $('div#registe_r2 pre').text(computer.CPU._r['r2']);
        $('div#registe_r3 pre').text(computer.CPU._r['r3']);
        $('div#registe_r4 pre').text(computer.CPU._r['r4']);
        $('div#registe_r5 pre').text(computer.CPU._r['r5']);
        $('div#registe_r6 pre').text(computer.CPU._r['r6']);
        $('div#registe_r7 pre').text(computer.CPU._r['r7']);
    };

    var startCPU = function(program) {
        var arch = RISC_AR4();
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

    //var program = loadFile();
    var program = [0x00];
    var computer = startCPU(program);
    //runCPU(computer);
    $('button#run_button').on('click', onClickRun());

}());
