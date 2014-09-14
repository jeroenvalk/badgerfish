/**
 * Copyright (C) 2014 dr. ir. Jeroen M. Valk
 * 
 * This file is part of Badgerfish CPX. Badgerfish CPX is free software: you can
 * redistribute it and/or modify it under the terms of the GNU Lesser General
 * Public License as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version. Badgerfish CPX is
 * distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details. You should have received a copy of the GNU Lesser General Public
 * License along with Badgerfish CPX. If not, see
 * <http://www.gnu.org/licenses/>.
 */

%lex

%s glob
%s xpath
%s jpath

%%

/*					*/\s+							/* skip whitespace */
<INITIAL>/*			*/"://"							return 'URL';
/*					*/"#"							%{ this.begin('xpath'); return '#'; %}
/*					*/"$"							%{ this.begin('jpath'); return '$'; %}
<xpath,jpath>/*		*/"/"							%{ this.begin('xpath'); return '/'; %}
/*					*/"/"							return 'SEP';
/*					*/"\\"							%{ this.begin('INITIAL'); return 'SEP'; %}
/*					*/"."							return 'DOT';
<xpath,jpath>/*		*/","							return ',';
<xpath>/*			*/"|"							return '|';
<xpath>/*			*/"::"							return 'AXIS';
<jpath>/*			*/":"							return ':';
<jpath>/*			*/"@"							return 'AT';
<jpath>/*			*/"?"							return 'Q';
<xpath,jpath>/*		*/"*"							return '*';
<xpath,jpath>/*		*/"and"							return "AND";
<xpath,jpath>/*		*/"or"							return "OR";
<xpath,jpath>/*		*/"^"							return '^';
<xpath,jpath>/*		*/"div"							return 'DIV';
<xpath,jpath>/*		*/"idiv"						return 'IDIV';
<xpath,jpath>/*		*/"%"							return 'MOD';
<xpath,jpath>/*		*/"-"							return '-';
<xpath,jpath>/*		*/"+"							return '+';
<xpath,jpath>/*		*/"=="							return 'EQ';
<xpath,jpath>/*		*/"!="							return 'NE';
<xpath,jpath>/*		*/"<"							return 'LT';
<xpath,jpath>/*		*/"<="							return 'LE';
<xpath,jpath>/*		*/">"							return 'GT';
<xpath,jpath>/*		*/">="							return 'GE';
<xpath,jpath>/*		*/"["							return '[';
<xpath,jpath>/*		*/"]"							return ']';
<xpath,jpath>/*		*/"("							return '(';
<xpath,jpath>/*		*/")"							return ')';
<xpath,jpath>/*		*/"'"([^'\\]|[\\].)*"'"			return 'STRING';
<xpath,jpath>/*		*/[0-9]+("."[0-9]+)?\b			return 'NUMBER'
<xpath,jpath>/*		*/[^/\\()\[\]|:-^*+=!<>\s.,#$]+	return 'TEXTA';
/*					*/"*"							return 'STAR';
/*					*/[^/\\#]+						return 'TEXTB';
/*					*/<<EOF>>						return 'EOF';
/*					*/.								return 'INVALID';

/lex

/* operator associations and precedence */

%left '#' '$'
%left OR
%left AND
%left EQ NE LT LE GT GE
%left '+' '-'
%left '*' DIV IDIV MOD
%left '^'
%left '|'
%left UMINUS UPLUS
%left '/' '//' SEP DOT

%start url

%% /* language grammar */

url
	: TEXTB URL authority absolute '#' fragments EOF
		{
			$6.unshift($4);
			$6.unshift($3);
			$6.unshift($1);
			typeof console !== 'undefined' ? console.log($1) : print($1);
			return $1;
		}
	| '#' fragments EOF
		{
			typeof console !== 'undefined' ? console.log($2) : print($2);
			return $2;
		}
	| fragments EOF
		{
			typeof console !== 'undefined' ? console.log($1) : print($1);
			return $1;
		}
	;

fragments
	: fragment
		{
			$$ = [$1];
		}
	| fragment '#' fragments
		{
			$3.unshift($1);
			$$ = $3;
		}
	;

fragment
	: absolute
		{
			$$ = $1;
		}
	| relative
		{
			$$ = $1;
		}
	;

absolute
	: SEP glob
		{
			$2.unshift(yy.Type.GLOB_ABSOLUTE);
			$$ = $2;
		}
	| '/' xpath
		{
			$2.unshift(yy.Type.XPATH_ABSOLUTE);
			$$ = $2;
		}
	| '/' '/' xpath
		{
			$3.unshift([yy.Axis.DESCENDANT,"*"]);
			$3.unshift(yy.Type.XPATH_ABSOLUTE);
			$$ = $3;
		}
	| '/' '$' DOT jpath
		{
			$4.unshift(yy.Type.JPATH_ABSOLUTE);
			$$ = $4;
		}
	;

relative
	: glob
		{
			$1.unshift(yy.Type.GLOB_RELATIVE);
			$$ = $1;
		}
	| xpath
		{
			$1.unshift(yy.Type.XPATH_RELATIVE);
			$$ = $1;
		}
	| '$' DOT jpath
		{
			$3.unshift(yy.Type.JPATH_RELATIVE);
			$$ = $3;
		}
	;
	
glob
	: gpart
	| gpart SEP
	| gpart SEP glob
	;

xpath
	: xpart
		{
			$$ = [];
		}
	| xpart '/' xpath
		{
			$$ = [];
		}
	| xpart '/' '/' xpath
		{
			$$ = [];
		}
	;

jpath
	: jpart
		{
			$1.unshift(yy.Axis.CHILD);
			$$ = $1;
		}
	| DOT jpart
		{
			$2.unshift(yy.Axis.DESCENDANT);
			$$ = $2;
		}
	| jpart DOT jpath
		{
			$1.unshift(yy.Axis.CHILD);
			$3.unshift($1);
			$$ = $3;
		}
	| DOT jpart DOT jpath
		{
			$1.unshift(yy.Axis.DESCENDANT);
			$3.unshift($1);
			$$ = $3;
		}
	;
	
gpart
	: DOT
	| DOT DOT
	| TEXTB
	| DOT TEXTB
	| TEXTB DOT STAR
	| STAR DOT TEXTB
	| STAR
	| DOT STAR
	| STAR DOT STAR
	| STAR STAR
	;

xpart
	: nodetest
	| nodetest predicate
	| TEXTA AXIS nodetest
	| TEXTA AXIS nodetest predicate
	;

jpart
	: nodetest
		{
			$$ = [$1];
		}
	| nodetest '[' slicing ']'
		{
			$3.unshift($1);
			$$ = $3;
		}
	| nodetest '[' Q '(' condition ')' ']'
		{
			$$ = [$1, $5];
		}
	;
	
nodetest
	: TEXTA
	| '*'
	;
	
slicing
	: '*'
		{
			$$ = [":",0,-1];
		}
	| ':' number
		{
			$$ = [':',NaN,$2];
		}
	| NUMBER ':'
		{
			$$ = [':',parseInt($1)];
		}
	| '-' NUMBER ':'
		{
			$$ = [':',-parseInt($2)];
		}
	| NUMBER ':' number
		{
			$$ = [':',parseInt($1),$3];
		}
	| '-' NUMBER ':' number
		{
			$$ = [':',-parseInt($2),$4];
		}
	| NUMBER ':' number ':' number 
		{
			$$ = [':',parseInt($1),$3,$5];
		}
	| '-' NUMBER ':' number ':' number 
		{
			$$ = [':',-parseInt($2),$4,$6];
		}
	| indices
		{
			$$ = $1;
		}
	;

indices
	: index
		{
			$$ = [$1];
		}
	| index ',' indices
		{
			$3.unshift($1);
			$$ = $3;
		}
	;

index
	: NUMBER
		{
			$$ = parseInt($1);
		}
	| TEXTA
		{
			$$ = $1;
		}
	| '(' expr ')'
	;

number
	: NUMBER
		{
			$$ = parseInt($1);
		}
	| '-' NUMBER
		{
			$$ = -parseInt($2);
		}
	;

predicate
	: '[' condition ']'
	;
	
condition
	: expr
		{
			$$ = $0;
		}
	| expr EQ expr
		{
			$$ = ['==',$1,$3];
		}
	| expr NE expr
		{
			$$ = ['!=',$1,$3];
		}
	| expr LT expr
		{
			$$ = ['<',$1,$3];
		}
	| expr LE expr
		{
			$$ = ['<=',$1,$3];
		}
	| expr GT expr
		{
			$$ = ['>',$1,$3];
		}
	| expr GE expr
		{
			$$ = ['>=',$1,$3];
		}
	| '(' condition ')'
		{
			$$ = $2;
		}
	| condition AND condition
		{
			$$ = ['&',$1,$3];
		}
	| condition OR condition
		{
			$$ = ['|',$1,$3];
		}
	;
	
expr
    : expr '+' expr
		{
			$$ = ['+',$1,$3];
		}
    | expr '-' expr
		{
			$$ = ['-',$1,$3];
		}
    | expr '*' expr
		{
			$$ = ['*',$1,$3];
		}
    | expr DIV expr
		{
			$$ = ['/',$1,$3];
		}
    | expr '^' expr
		{
			$$ = ['^',$1,$3];
		}
    | '-' expr %prec UMINUS
		{
			$$ = ['-',$2];
		}
    | '+' expr %prec UPLUS
		{
			$$ = ['+',$2];
		}
    | '(' e ')'
		{
			$$ = $2;
		}
	| TEXTA '(' ')'
		{
			$$ = [$1];
		}
	| TEXTA '(' argv ')
		{
			$3.unshift($1);
			$$ = $3;
		}
    | NUMBER
		{
			$$ = parseFloat($1);
		}
	| AT DOT jpath
		{
			$$ = $3;
		}
	| xpath
    ;
