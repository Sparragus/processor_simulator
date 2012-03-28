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
            for( var i=0; i<s.length; i++){
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
        if(computer.CPU._r['acc']<0){
          $('div#accumulator pre').text(extendZeroes((computer.CPU._r['acc']+256).toString(2),8));

        }
        else{
        $('div#accumulator pre').text(extendZeroes(computer.CPU._r['acc'].toString(2),8));
        }
          // ZNCO Flags
        $('div#zero_flag pre').text(computer.CPU._getFlag('Z'));
        $('div#negative_flag pre').text(computer.CPU._getFlag('N'));
        $('div#carry_flag pre').text(computer.CPU._getFlag('C'));
        $('div#overflow_flag pre').text(computer.CPU._getFlag('O'));
        // Registers
        if(computer.CPU._r['r0']<0){
          $('div#register_0 pre').text(extendZeroes((computer.CPU._r['r0']+256).toString(2),8));

        }
        else{
        $('div#register_0 pre').text(extendZeroes(computer.CPU._r['r0'].toString(2),8));
        }
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
        return function() {
            runCPU(computer);
        };
    };

    var onClickControlButtons = function(run_handler, step_handler) {
        var run_ = run_handler();
        var step_ = step_handler();
        return function (e) {
            console.log(e);
            if (e.target.id === "run_button") {
                run_();
            }
            else {
                step_();
            }
        };
    };

    var computer;
    var hello = function() {
        setTimeout(function () {
            var program = mem;
            computer = startCPU(program);
            updateMemoryDisplay(computer);
            $('div#control_buttons').on('click', onClickControlButtons(onClickRun, onClickStep));
        }, 1000);
    };
    document.getElementById('fileinput').addEventListener('change', readFile, false);
    document.getElementById('fileinput').addEventListener('change', hello, false);

	//Subscribe input and output devices to "interrupts"
	$(document).ready(function(){
		$("#device_driver").on("out", function(e, data){
			//replace one
			var stringPos = data.mempos-252;
			var displayPre = $(this).find("#display pre");
			var displayText = displayPre.text();
			var asciiFromMem = String.fromCharCode(data.mem.readb(data.memPos));
			var newText = displayText.substr(0, stringPos) + asciiFromMem + displayText.substr(stringPos + 1, displayText.length);
			displayPre.text(newText);
		});

		$("#device_driver").on("in", function(e, data){
			//since cpu is not multicore, set to idle until it waits for input
			data.cpu._status.idle = 1;

			var keyboardDialog = $("#keyboardDialog");
			keyboardDialog.dialog2("open");

			$(keyboardDialog).find("#keyboardDialogSubmit").on("click", function(){

				//Get written input from text
				var keyboardInputText = keyboardDialog.find("#keyboardInputText")

				//write ascii to memory
				var ascii = keyboardInputText.val().charCodeAt(0);

				data.mem.writeb(data.memPos, ascii);

				//write ascii to accumulator and update flags
				data.cpu._r.acc = ascii;

				//update flags
				data.cpu._setFlag("Z", data.cpu._r.acc === 0 ? 1 : 0);
				data.cpu._setFlag("N", data.cpu._r.acc < 0 ? 1 : 0);

				//reset the keyboard input text
				keyboardInputText.val("");

				//update memory ui
				updateMemoryDisplay(computer);

				//update acumulator ui
				$('div#accumulator pre').text(extendZeroes(data.cpu._r['acc'].toString(2),8));

				//change status to not idle
				data.cpu._status.idle = 0;

			});
		});

		//Initialize dialog
        $("#keyboardDialog").dialog2({
            showCloseHandle: false,
            removeOnClose: false,
            autoOpen: false,
            closeOnEscape: false,
            closeOnOverlayClick: false
        });
	});

}());
