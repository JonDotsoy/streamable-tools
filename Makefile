lib_path = ./lib
types_path = $(lib_path)/types
esm_path = $(lib_path)/esm
cjs_path = $(lib_path)/cjs

all:
	@exit 0

build: clean_lib build@esm build@cjs build@types

clean_lib:
	rm -rf "$(lib_path)/"

build@types:
	rm -rf "$(types_path)/"
	npx tsc --project tsconfig.types.json --outDir "$(types_path)/"

build@esm:
	rm -rf "$(esm_path)/"
	npx tsc --project tsconfig.esm.json --outDir "$(esm_path)/"
	echo '{"type": "module"}' > "$(esm_path)/package.json"

build@cjs:
	rm -rf "$(cjs_path)/"
	npx tsc --project tsconfig.cjs.json --outDir "$(cjs_path)/"
	echo '{"type": "commonjs"}' > "$(cjs_path)/package.json"
