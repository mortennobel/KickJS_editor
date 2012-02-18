#!/bin/sh
# The location of your yuidoc install
yuidoc_home=$1

#Location of project
project=$2

# The location of the files to parse.  Parses subdirectories, but will fail if
# there are duplicate file names in these directories.  You can specify multiple
# source trees:
parser_in=$project/war/js/editor

# The location to output the parser data.  This output is a file containing a
# json string, and copies of the parsed files.
parser_out=$project/API/parser

# The directory to put the html file outputted by the generator
generator_out=$project/API/generator

projecturl=http://www.kickjs.org/

version=0_3_1
yuiversion=3

# The location of the template files.  Any subdirectories here will be copied
# verbatim to the destination directory.
template=$project/build-asset/doc-template

##############################################################################
echo "Generating documentation (YUI Doc)"

mkdir $parser_out
mkdir generator_out
echo $yuidoc_home/bin/yuidoc.py $parser_in -p $parser_out -o $generator_out -t $template -v $version -Y $yuiversion -m "$projectname" -u $projecturl
$yuidoc_home/bin/yuidoc.py $parser_in -p $parser_out -o $generator_out -t $template -v $version -Y $yuiversion -m "$projectname" -u $projecturl
