var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var fs = require("fs");
var LOC = 100;
var chains = 10;
var nesting_if = 5;

const path = require("path");
const getAllFiles = function(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)
 
  arrayOfFiles = arrayOfFiles || []
 
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
	  if (file.endsWith("js") && dirPath.includes('node_modules')==false){		
      arrayOfFiles.push(path.join(dirPath, "/", file))
	  }
    }
  })
  
//   console.log(arrayOfFiles)

  return arrayOfFiles
} 

function main()
{
	var args = process.argv.slice(2);
	const result = getAllFiles("./app/server-side")
	//const result = getAllFiles('/home/vaishnavidoraiswamy/checkbox.io/server-side/site/')

	console.log(result)
	
	if( args.length == 0 )
	{
		args = ["analysis.js"];
	}
	//var filePath = args[0];
	var filePath = result
	for (let file_name of filePath){

		complexity(file_name)
	}	
	//complexity(filePath);

	// Report
	for( var node in builders )
	{
		var builder = builders[node];
		builder.report();
	}

}


 
 



var builders = {};

// Represent a reusable "class" following the Builder pattern.
function FunctionBuilder()
{
	this.StartLine = 0;
	this.FunctionName = "";
	// The number of parameters for functions
	this.ParameterCount  = 0,
	// Number of if statements/loops + 1
	this.SimpleCyclomaticComplexity = 0;
	// The max depth of scopes (nested ifs, loops, etc)
	this.MaxNestingDepth    = 0;
	// The max number of conditions if one decision statement.
	this.MaxConditions      = 0;
	this.MaxMsgChains = 0;
	this.LOC=0;

	this.report = function()
	{
		
		if (LOC < this.LOC){
			console.log("LOC threshold exceeded for ", "\"",this.FunctionName,"\"")
			throw console.error("Threshold for LOC has been exceeded");
		}
		if (nesting_if < this.MaxNestingDepth){
			console.log("Nested if threshold has been exceeded for ", "\"",this.FunctionName,"\"")
			throw console.error("Threshold for Nestedif has been exceeded");
		}
		if (chains < this. MaxMsgChains){
			console.log("Max Msg chains has been exceeded ","\"",this.FunctionName,"\"")
			throw console.error("Max message chain has been exceeded");
		}
		
		
		
		
		
		
		
		console.log(
		   (
		   	"{0}(): {1}\n" +
		   	"============\n" +
			   "SimpleCyclomaticComplexity: {2}\t" +
				"MaxNestingDepth: {3}\t" +
				"MaxConditions: {4}\t" +
				"Parameters: {5}\t"+
				"MaxMsgChains : {6}\n\t"+
				"LOC: {7}"
			)
			.format(this.FunctionName, this.StartLine,
				     this.SimpleCyclomaticComplexity, this.MaxNestingDepth,
			        this.MaxConditions, this.ParameterCount,this.MaxMsgChains, this.LOC)
		);
	}
};

// A builder for storing file level information
function FileBuilder()
{
	this.FileName = "";
	// Number of strings in a file.
	this.Strings = 0;
	// Number of imports in a file.
	this.ImportCount = 0;

	this.report = function()
	{
		console.log (
			( "{0}\n" +
			  "~~~~~~~~~~~~\n"+
			  "ImportCount {1}\t" +
			  "Strings {2}\n"
			).format( this.FileName, this.ImportCount, this.Strings ));
	}
}

// A function following the Visitor pattern.
// Annotates nodes with parent objects.
function traverseWithParents(object, visitor)
{
    var key, child;

    visitor.call(null, object);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null && key != 'parent') 
            {
            	child.parent = object;
					traverseWithParents(child, visitor);
            }
        }
    }
}

function maxif(object,depth)
{
	builder = builders[fname]
	builder.MaxNestingDepth = Math.max(depth,builder.MaxNestingDepth)
	builders[builder] = builder
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null && key != 'parent') 
            {
            	child.parent = object;
				if(object.type === 'IfStatement' && object.alternate === null){
					// console.log(object.test.name)
					maxif(child,depth+1)
				}
				else if(object.type === 'IfStatement'){
					maxif(object.consequent,depth+1)
					maxif(object.alternate,depth)
				}
				else{
					maxif(child,depth)
				}
            }
        }
    }
}




function complexity(filePath)
{
	// console.log(filePath)
	var buf = fs.readFileSync(filePath, "utf8");
	var ast = esprima.parse(buf, options);

	var i = 0;
	
	// A file level-builder:
	var fileBuilder = new FileBuilder();
	fileBuilder.FileName = filePath;
	fname="";
	fileBuilder.ImportCount = 0;
	builders[filePath] = fileBuilder;

	// Tranverse program with a function visitor.
	traverseWithParents(ast, function (node) 
	{
		if (node.type === 'FunctionDeclaration') 
		{
			var builder = new FunctionBuilder();
			fname = functionName(node);
			builder.FunctionName = functionName(node);
			builder.StartLine    = node.loc.start.line;
			builder.EndLine    = node.loc.end.line;
			builder.LOC = builder.EndLine - builder.StartLine 
			builders[builder.FunctionName] = builder;
		
			traverseWithParents(node, function(node){
			if (node.type === 'MemberExpression') 
			{
				builder = builders[fname];
				//builder.MaxMsgChains = Math.max(local,builder.MaxMsgChains);
				//console.log(builder.FunctionName, builder.MaxConditions)
				current = 0
				traverseWithParents(node, function(node){
					if (node.type=='MemberExpression'){ 
						// console.log(local)
						current = current + 1;
						if (current>builder.MaxMsgChains){
							builder.MaxMsgChains = current;
						}
					}
				
				});
				builders[fname] = builder;
				// console.log(builders[fname])
			}})	
		

			traverseWithParents(node, function(node){
				builder = builders[fname]
				nesting = 0
				if (node.type === 'IfStatement'){
					maxif(node,nesting)
				}
			})
		}


	});

}

// Helper function for counting children of node.
function childrenLength(node)
{
	var key, child;
	var count = 0;
	for (key in node) 
	{
		if (node.hasOwnProperty(key)) 
		{
			child = node[key];
			if (typeof child === 'object' && child !== null && key != 'parent') 
			{
				count++;
			}
		}
	}	
	return count;
}


// Helper function for checking if a node is a "decision type node"
function isDecision(node)
{
	if( node.type == 'IfStatement' || node.type == 'ForStatement' || node.type == 'WhileStatement' ||
		 node.type == 'ForInStatement' || node.type == 'DoWhileStatement')
	{
		return true;
	}
	return false;
}


// Helper function for printing out function name.
function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "anon function @" + node.loc.start.line;
}

// Helper function for allowing parameterized formatting of strings.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

main();

function Crazy (argument) 
{

	var date_bits = element.value.match(/^(\d{4})\-(\d{1,2})\-(\d{1,2})$/);
	var new_date = null;
	if(date_bits && date_bits.length == 4 && parseInt(date_bits[2]) > 0 && parseInt(date_bits[3]) > 0)
    new_date = new Date(parseInt(date_bits[1]), parseInt(date_bits[2]) - 1, parseInt(date_bits[3]));

    var secs = bytes / 3500;

      if ( secs < 59 )
      {
          return secs.toString().split(".")[0] + " seconds";
      }
      else if ( secs > 59 && secs < 3600 )
      {
          var mints = secs / 60;
          var remainder = parseInt(secs.toString().split(".")[0]) -
(parseInt(mints.toString().split(".")[0]) * 60);
          var szmin;
          if ( mints > 1 )
          {
              szmin = "minutes";
          }
          else
          {
              szmin = "minute";
          }
          return mints.toString().split(".")[0] + " " + szmin + " " +
remainder.toString() + " seconds";
      }
      else
      {
          var mints = secs / 60;
          var hours = mints / 60;
          var remainders = parseInt(secs.toString().split(".")[0]) -
(parseInt(mints.toString().split(".")[0]) * 60);
          var remainderm = parseInt(mints.toString().split(".")[0]) -
(parseInt(hours.toString().split(".")[0]) * 60);
          var szmin;
          if ( remainderm > 1 )
          {
              szmin = "minutes";
          }
          else
          {
              szmin = "minute";
          }
          var szhr;
          if ( remainderm > 1 )
          {
              szhr = "hours";
          }
          else
          {
              szhr = "hour";
              for ( i = 0 ; i < cfield.value.length ; i++)
				  {
				    var n = cfield.value.substr(i,1);
				    if ( n != 'a' && n != 'b' && n != 'c' && n != 'd'
				      && n != 'e' && n != 'f' && n != 'g' && n != 'h'
				      && n != 'i' && n != 'j' && n != 'k' && n != 'l'
				      && n != 'm' && n != 'n' && n != 'o' && n != 'p'
				      && n != 'q' && n != 'r' && n != 's' && n != 't'
				      && n != 'u' && n != 'v' && n != 'w' && n != 'x'
				      && n != 'y' && n != 'z'
				      && n != 'A' && n != 'B' && n != 'C' && n != 'D'
				      && n != 'E' && n != 'F' && n != 'G' && n != 'H'
				      && n != 'I' && n != 'J' && n != 'K' && n != 'L'
				      && n != 'M' && n != 'N' &&  n != 'O' && n != 'P'
				      && n != 'Q' && n != 'R' && n != 'S' && n != 'T'
				      && n != 'U' && n != 'V' && n != 'W' && n != 'X'
				      && n != 'Y' && n != 'Z'
				      && n != '0' && n != '1' && n != '2' && n != '3'
				      && n != '4' && n != '5' && n != '6' && n != '7'
				      && n != '8' && n != '9'
				      && n != '_' && n != '@' && n != '-' && n != '.' )
				    {
				      window.alert("Only Alphanumeric are allowed.\nPlease re-enter the value.");
				      cfield.value = '';
				      cfield.focus();
				    }
				    cfield.value =  cfield.value.toUpperCase();
				  }
				  return;
          }
          return hours.toString().split(".")[0] + " " + szhr + " " +
mints.toString().split(".")[0] + " " + szmin;
      }
  }
 exports.main = main;
