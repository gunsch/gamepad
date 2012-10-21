SCRIPTS_TMP := scripts #"$(shell mktemp /tmp/XXXXXX)"
JS_SRCS = $(wildcard gamepad/*.js)
JS_OUTPUTS =

BUILDER = closure-library/closure/bin/build/closurebuilder.py
COMPILER = closure-compiler/compiler.jar

BUILDER_FLAGS = --root=closure-library --root=gamepad --namespace=gamepad

all: release

debug: JS_OUTPUTS += $(shell $(BUILDER) $(BUILDER_FLAGS))
debug: demo.html

release: JS_OUTPUTS += compiled.js
release: BUILDER_FLAGS += -f "--warning_level=VERBOSE"
release: BUILDER_FLAGS += -f "--js_output_file=compiled.js"
release: BUILDER_FLAGS += -f "--compilation_level=ADVANCED_OPTIMIZATIONS"
release: BUILDER_FLAGS += --output_mode=compiled
release: BUILDER_FLAGS += --compiler_jar=$(COMPILER)
release: compiled.js demo.html

compiled.js: $(JS_SRCS)
	$(BUILDER) $(BUILDER_FLAGS)

demo.html: scripts demo/contents.html
	cat $(SCRIPTS_TMP) demo/contents.html > demo.html
	rm $(SCRIPTS_TMP)

scripts:
	perl -pe "s/([^\s]+)/<script src='\$$1'><\/script>/g" \
        <<< "$(JS_OUTPUTS)" \
		> $(SCRIPTS_TMP)
	cat $(SCRIPTS_TMP)

clean:
	rm -f demo.html compiled.js scripts

