/* Цель: создать генератор верных и неверных тождеств по тригонометрии
тождество содержит 2 выражения: left и right
выражение может быть символом, функцией от выражения, суммой, разностью, произведением или частным от двух выражений
выражение можно записать в виде строки latex
тождество получается из другого тождества несколькими способами
Цель 1:
 создаем 3 типа символов: целые числа, дроби и дроби с переменной
 создаем класс выражение
 создаем класс тождество
 создаем 


1) symbol - класс, который имеет тип и в зависимости от типа содержит один из следующих объектов:
'd': целое число
'f': дробное число
//'r': обыкновенную дробь
//'ir': дробь вида \sqrt{a}b/c
'v': переменную
'c': константу pi или e
//'vr': дробь вида alpha*a/b
//'cr: дробь вида pi/a
//методы plus, minus работают для пары символов одного типа, либо типов ir и r, ir и d, d и r, d и f, v и vr, c и cr, (f и r)
//методы mult и div работают только для типов d,f,r,ir, а также для пар {d,r} и {v,c,vr,cr}

метод toLatex()
метод getRandom(types)
метод isEqual(symbol)
метод latexToSymbol(string)
?метод stringToSymbol(string) //понимает строки типа 2/3, sqrt(3)/6,...
массивы символов specangdeg, specangrad, ang45, ang30, simplen, simplef, simpler, simplevr, simpleir

2) выражение: 
Тип:
's': символ {symbol s;}
'f': функция {func f; equation eq;}
'par': выражение в скобках {equation eq;}
'sum', 'dif', 'mul', 'div': {equation eq1, eq2;}
методы mult, sum, dif, div, par, f, возращающие выражение
метод toString{
switch(type)
{
	case 's': return s.toString();
	case 'f': return f.name+'('+eq.toString()+')';
	case 'par': return '('+eq.toString()+')';
	case 'sum': return eq1.toString() + ' + ' + eq2.toStirng();
	case 'dif': return eq1.toString() + ' - ' + eq2.toStirng();
	case 'mul': return eq1.toString() + ' * ' + eq2.toStirng();
	case 'div': return eq1.toString() + ' / ' + eq2.toStirng();
}
метод substitute(variable, eq) //подставляет вместо переменной variable другое выражение. Если такой переменной нет, то возвращает исходное выражение
{
	if(this.type == 's') {
		if (this.s.type == 'v' && this.s.name == variable) return eq;
		else return this; }
	else if (this.type == 'par') return par(this.eq.substitute(eq));
	else if (this.type == 'sum') return sum(this.eq1.substitute(eq),this.eq1.substitute(eq));
	...
		
}
	
3) тождество: два тождественно равных выражения с некоторым набором переменных
identity {equation: eq1, eq2; var correct;}
метод isCorrect
метод setCorrect
метод substitute(identity)

4) преобразования тождества:
	А) замена переменной на тождественные выражения
	Б) перенос множителя или слагаемого в другую часть
	В) подстановка правой и левой части в качестве одной переменной в другое тождество 
5) некорректные преобразования
	А) подстановка в качестве одной переменной нетождественных выражений
	Б) неправильный перенос множителя или слагаемого в другую часть
	В) замена вида функции

Для создания задач мы определяем
1) типы символов для наших операций
2.1) типы функций в выражениях
2.2) максимальная "сложность" выражения
3) тождества, которые проверяются задачами
4) набор тождеств, допустимых для подстановки (более простые тождества)

Задача - это правильное или неправильное тождество, сгенерированное по правилам */

Symbol.stypes = function() {
return ["d","f","v","c","º","inf"];}

var varnames = ["x","y","alpha","beta"];
var consts = ['pi','e'];
var MAXN = 10;
var FDIGITS = 3, AFTERDOT = 2;

var g, h; //просто глобальная переменная


//!!!!!!!!!!____________________SYMBOL OBJECT DESCRIPTION _____________!!!!!!!!!!!!!!
var symbol = {
	type: '',
	name: ''
}

function Symbol(n,t){
	if(n == undefined) { this.type = undefined; this.name = undefined; return; }
	if(t == undefined)
		this.symFromStr(n);
	else
	{
		this.type = t;
		this.name = n;
	}
}
	
Symbol.prototype.toString = function(){
		if (this.type == 'º') return this.name + 'º';
		return this.name;
}


Symbol.prototype.symFromStr = function(st){
		if (st == 'pi' || st == 'e') {	
			this.type = 'c';
			this.name = st;	
		}
		else if (st == 'inf') {
			this.type = 'inf';
			this.name = 'inf';
		}
		else if(/^\d*.?\d*º$/.test(st)) { this.type = 'º'; this.name = st.substr(0,st.length-1); }
		else if(/^[a-z]+\d*$/.test(st)) { this.type = 'v'; this.name = st; }
		else if(/^-?\d+$/.test(st)) { this.type = 'd'; this.name = st; }
		else if(/^-?\d*[.]\d*$/.test(st)) { this.type = 'f'; this.name = st; }
		return this;
}

var randomSymbol = function(type){
	var s = new Symbol();
	if (!type) {
		var i = Math.floor(Math.random()*Symbol.stypes.length);
		type = Symbol.stypes[i];
	}
	var n;
	switch (type)
	{
		case 'd': n = (Math.random()*MAXN).toFixed(0); break;
		case 'f': n = (Math.random()*FDIGITS).toFixed(AFTERDOT); break;
		case 'v': n = varnames[Math.floor(Math.random()*varnames.length)]; break;
		case 'c': n = consts[Math.floor(Math.random()*consts.length)]; break;
		case 'º': n = (Math.random()*90).toFixed(0); break;
	}
	s.type = type;
	s.name = n;
	return s;
}

//!!!!!!!!!!____________________EQUATION OBJECT DESCRIPTION _____________!!!!!!!!!!!!!!
Equation.eqtypes = function(){
	return ["s","fun","par","neg","sum",'dif','mul','div','pow'];
}

var equation = {
	type : '',
	eq1 : '',
	eq2 : '',
	f : ''
}


function Equation(t,e1,e2,fname) {
		this.type = t;
		this.eq1 = e1;
		this.eq2 = e2;
		this.f = fname;
}
	
Equation.prototype.toString = function(t){
	
	//console.log(t);
	if(this.eq1){
	switch(this.type)
	{
		case 's': return this.eq1.toString();
		case 'fun': 
			var s = this.f;
			if (t == 'nerd' || t == 'n' || t == 'nerdamer') //возвращаем строку, которую поймент nerdamer
				s = s.rusnerd();
			return s +'('+this.eq1.toString(t)+')';
		case 'par': return '('+this.eq1.toString(t)+')';
		case 'neg': return '-'+this.eq1.toString(t);
		case 'sum': return this.eq1.toString(t) + ' + ' + this.eq2.toString(t);
		case 'dif': return this.eq1.toString(t) + ' - ' + this.eq2.toString(t);
		case 'mul': return this.eq1.toString(t) + ' * ' + this.eq2.toString(t);
		case 'div': return this.eq1.toString(t) + ' / ' + this.eq2.toString(t);
		case 'pow': return this.eq1.toString(t) + '^' + this.eq2.toString(t);
	}
	}
	else return '';
}

Equation.env = function() {
	return ['sin','cos','tg','ctg','log','ln','sqrt','exp','abs','arccos', 'arcsin', 'arctg', 'arcctg'];
}

//var eqFromString = function(str) {} //эту функцию неплохо бы написать, но для этого предется сделать parser

var eqFromSym = function(sym) {
	var eq = new Equation();
	eq.type = 's';
	eq.eq1 = sym;
	return eq;
}

var eqFromFun = function(f,argeq) {
	var eq = new Equation();
	eq.type = 'fun';
	eq.f = f;
	eq.eq1 = argeq;
	return eq;
}

Equation.prototype.sum = function(argeq)
{
	var eq = new Equation();
	eq.type = 'sum';
	eq.f = '';
	eq.eq1 = this;
	eq.eq2 = argeq;
	return eq;
}

Equation.prototype.dif = function(argeq)
{
	var eq = new Equation();
	eq.type = 'dif';
	eq.f = '';
	eq.eq1 = this;
	eq.eq2 = argeq;
	return eq;
}

Equation.prototype.mult = function(argeq)
{
	var eq = new Equation();
	eq.type = 'mul';
	eq.f = '';
	eq.eq1 = this;
	eq.eq2 = argeq;
	return eq;
}

Equation.prototype.div = function(argeq)
{
	var eq = new Equation();
	eq.type = 'div';
	eq.f = '';
	eq.eq1 = this;
	eq.eq2 = argeq;
	return eq;
}

Equation.prototype.par = function()
{
	var eq = new Equation();
	eq.type = 'par';
	eq.f = '';
	eq.eq1 = this;
	return eq;
}

Equation.prototype.neg = function()
{
	var eq = new Equation();
	eq.type = 'neg';
	eq.f = '';
	eq.eq1 = this;
	return eq;
}

Equation.prototype.pow = function(argeq)
{
	var eq = new Equation();
	eq.type = 'pow';
	eq.f = '';
	eq.eq1 = this;
	eq.eq2 = argeq;
	return eq;
}

Equation.prototype.substitute = function(v, eq) //подставляет вместо переменной v другое выражение. Если такой переменной нет, то возвращает исходное выражение 
{
	if(this.type == 's') {
		if (this.eq1.type == 'v' && this.eq1.name == v) return eq;
		else return this; }
	else if (this.type == 'par') return this.eq1.substitute(v, eq).par();
	else if (this.type == 'neg') return this.eq1.substitute(v, eq).neg();
	else if (this.type == 'fun') return eqFromFun(this.f,this.eq1.substitute(v,eq));
	else if (this.type == 'sum') return this.eq1.substitute(v,eq).sum(this.eq2.substitute(v,eq));
	else if (this.type == 'div') return this.eq1.substitute(v,eq).div(this.eq2.substitute(v,eq));
	else if (this.type == 'dif') return this.eq1.substitute(v,eq).dif(this.eq2.substitute(v,eq));
	else if (this.type == 'mul') return this.eq1.substitute(v,eq).mult(this.eq2.substitute(v,eq));
	else if (this.type == 'pow') return this.eq1.substitute(v,eq).pow(this.eq2.substitute(v,eq));		
}

Equation.prototype.substitutek = function(v, eq, k) //подставляет на k-е вхождение вместо переменной v другое выражение. Если такой переменной нет, то возвращает исходное выражение 
{
	if(this.type == 's') {
		if (this.eq1.type == 'v' && this.eq1.name == v && k == 1) return eq;
		else return this; }
	else if (this.type == 'par') return this.eq.substitutek(v, eq, k).par();
	else if (this.type == 'neg') return this.eq.substitutek(v, eq, k).neg();
	else if (this.type == 'fun') return eqFromFun(this.f,this.eq1.substitutek(v,eq, k));
	else 
	{
		var a1 = [], a2 = [];
		if(this.eq1) a1 = this.eq1.listVars();
		if(this.eq2) a2 = this.eq2.listVars();
		var n1 = numEntry(a1,v);
		var n2 = numEntry(a2,v);
		if (n1+n2 < k) return this;
		else if (this.type == 'sum') 
			return n1 >= k ? (this.eq1.substitutek(v,eq,k)).sum(this.eq2) : this.eq1.sum(this.eq2.substitutek(v,eq,k-n1));
		else if (this.type == 'div')
			return n1 >= k ? (this.eq1.substitutek(v,eq,k)).div(this.eq2) : this.eq1.div(this.eq2.substitutek(v,eq,k-n1));
		else if (this.type == 'dif')
			return n1 >= k ? (this.eq1.substitutek(v,eq,k)).dif(this.eq2) : this.eq1.dif(this.eq2.substitutek(v,eq,k-n1));
		else if (this.type == 'mul')
			return n1 >= k ? (this.eq1.substitutek(v,eq,k)).mult(this.eq2) : this.eq1.mult(this.eq2.substitutek(v,eq,k-n1));
		else if (this.type == 'pow')
			return n1 >= k ? (this.eq1.substitutek(v,eq,k)).pow(this.eq2) : this.eq1.pow(this.eq2.substitutek(v,eq,k-n1));
	}
}


Equation.prototype.listVars = function() { //массив переменных, используемых в выражении, со всеми повторениями
	if (this.type == 's') {
		if (this.eq1.type == 'v') return [this.eq1.name];
		else return []; }
	else if (this.eq1 && this.eq2)
		return this.eq1.listVars().concat(this.eq2.listVars());
	else if (this.eq1) return this.eq1.listVars();
	else return [];
}

Equation.prototype.isEqual = function(eq) { //проверяет на равенство два выржаения
	if (this.type != eq.type) return 0;
	switch(this.type)
	{
		case 's': return this.eq1.name == eq.eq1.name;
		case 'fun': return (this.f == eq.f && this.eq1.isEqual(eq.eq1));
		case 'par': return (this.eq1.isEqual(eq.eq1));
		case 'neg': return (this.eq1.isEqual(eq.eq1));
		default: return (this.eq1.isEqual(eq.eq1) && this.eq2.isEqual(eq.eq2));
	}
}


//!!!!!!!!!!____________________IDENTITY OBJECT DESCRIPTION _____________!!!!!!!!!!!!!!

var identity = {
//	type : '', //пока считаем, что все тождества одного типа
	eq1 : '',
	eq2 : '',
	holds : ''
}

function Identity(eq1,eq2,h) {
//		this.type = t;
		this.eq1 = eq1;
		this.eq2 = eq2;
		this.holds = h;
}

Identity.prototype.toString = function(){
	if(this.eq1 && this.eq2){ 	//для равенства нужны две части
		return this.eq1.toString()+' = ' +this.eq2.toString();
	}
	else return '';
}

Identity.prototype.substitute = function(v, eq){ //замена переменной v на eq во всем равенстве
	var ident = new Identity(this.eq1,this.eq2,this.holds);
	ident.eq1 = ident.eq1.substitute(v,eq);
	ident.eq2 = ident.eq2.substitute(v,eq);
	return ident;
}

Identity.prototype.substituteid = function(argid) //подставляем правую и левую часть вместо первой встретившейся пары одинаковых переменных
{
	var ident = new Identity(this.eq1,this.eq2,this.holds);
	var vs = this.doubleVars();
	var v;
	if (vs.length) v = vs[0]; //будем менять первую повторяющуюся переменную
	//меняем первое вхождение на argid.eq1, а второе на argid.eq2
	if(numEntry(this.eq1.listVars(),v) > 1) {
		ident.eq1 = ident.eq1.substitutek(v,argid.eq1,2);
		ident.eq1 = ident.eq1.substitutek(v,argid.eq2,1);
		}
	else if(numEntry(this.eq1.listVars(),v) >= 1) {
		ident.eq1 = ident.eq1.substitutek(v,argid.eq1,1);
		ident.eq2 = ident.eq2.substitutek(v,argid.eq2,1);
		}
	else {
		ident.eq2 = ident.eq2.substitutek(v,argid.eq1,2);
		ident.eq2 = ident.eq2.substitutek(v,argid.eq2,1);
	}
	return ident;
}

Identity.prototype.doubleVars = function() {
	return multipleEntry(this.listVars());
}

Identity.prototype.listVars = function() {
	if (this.eq1 && this.eq2)
		return this.eq1.listVars().concat(this.eq2.listVars());
	else return null;
}


//!!!!!!!!___________________TRANSFORMATIONS____________________!!!!!!!!!!!!!!

Identity.prototype.transform = function(type){ //возвращает identity после замены. this не меняет

var iden = this, eq1, eq2;
var trtypes = [
'x = y -> y = x', //Сохраняет holds исходного
	'x + y = z -> y + x = z' , //Сохраняет holds, если тип mul, sum, дает false, если div, и dif
	'x + y = z -> x = z - y', //сохраняет holds для любого знака
	'x + y = z -> y = z - x', //сохраняет holds для + и * и дает false для - и /
	'x - y = z -> x = y + z', //сохраняет holds для - и / и дает false для + и *
	'x + y = z -> x = z + y', //меняет holds на false для любого знака
	
	'z = x + y -> z = y + x', //Сохраняет holds, если тип mul, sum, дает false, если div, и dif
	'z = x + y -> z - y = x', //сохраняет holds для любого знака
	'z = x + y -> z - x = y', //сохраняет holds для + и * и дает false для - и /
	'z = x - y -> y + z = x', //сохраняет holds для - и / и дает false для + и *
	'z = x + y -> z + y = x' 
	]; //меняет holds на false для любого знака

	if(type == undefined) { type = trtypes.getRandom(); }
	if(typeof(type)=='number') {type = trtypes[type]; }
	
	if(['mul','sum','div','dif'].indexOf(this.eq1.type) < 0) return this;
	
	switch (type)
	{
		case 'x = y -> y = x': 
			iden = new Identity(this.eq2,this.eq1,this.holds); 
			break;
		case 'x + y = z -> y + x = z': 
			eq1 = new Equation(this.eq1.type,this.eq1.eq2,this.eq1.eq1);
			iden = new Identity(eq1,this.eq2,this.holds && this.eq1.type.mulsum());
			break;
		case 'x + y = z -> x = z - y': 
			eq2 = new Equation(this.eq1.type.revType(),this.eq2,this.eq1.eq2);
			iden = new Identity(this.eq1.eq1,eq2,this.holds);
			break;			
		case 'x + y = z -> y = z - x': 
			eq2 = new Equation(this.eq1.type.revType(),this.eq2,this.eq1.eq1);
			iden = new Identity(this.eq1.eq2,eq2,this.holds && this.eq1.type.mulsum());
			break;
		case 'x - y = z -> x = y + z': 
			eq2 = new Equation(this.eq1.type.revType(),this.eq1.eq2,this.eq2);
			iden = new Identity(this.eq1.eq1,eq2,this.holds  && !this.eq1.type.mulsum());
			break;
		case 'x + y = z -> x = z + y': 
			eq2 = new Equation(this.eq1.type,this.eq2,this.eq1.eq2);
			iden = new Identity(this.eq1.eq1,eq2,false);
			break;
		case 'z = x + y -> z = y + x': 
			eq2 = new Equation(this.eq2.type,this.eq1.eq2,this.eq1.eq1);
			iden = new Identity(this.eq1,eq2,this.holds && this.eq1.type.mulsum());
			break;
		case 'z = x + y -> z - y = x': 
			eq1 = new Equation(this.eq2.type.revType(),this.eq1,this.eq2.eq2);
			iden = new Identity(eq1,this.eq1.eq1,this.holds);
			break;
		case 'z = x + y -> z - x = y': 
			eq1 = new Equation(this.eq2.type.revType(),this.eq1,this.eq1.eq1);
			iden = new Identity(eq1,this.eq2.eq2,this.holds && this.eq1.type.mulsum());
			break;
		case 'z = x - y -> y + z = x': 
			eq1 = new Equation(this.eq2.type.revType(),this.eq2.eq2,this.eq1);
			iden = new Identity(eq1,this.eq1.eq1,this.holds && !this.eq1.type.mulsum());
			break;
		case 'z = x + y -> z + y = x': 
			eq1 = new Equation(this.eq2.type,this.eq1,this.eq2.eq2);
			iden = new Identity(eq1,this.eq1.eq1,false);
			break;
	}
	return iden;
	
}

//!!!!!!!!___________________SUBSTITUTE____________________!!!!!!!!!!!!!!

var subst = {
	vars: [],
	eqs: []
}

function Subst(v,strs){
		this.vars = v;
		var i;
		this.eqs = [];
		for(i = 0; i < strs.length; i++)
			this.eqs.push(parse(strs[i]));
}

Equation.prototype.subst = function(a,c) { //если this содержит элемент вида a(b()), то он меняется  на выражение по схеме c(b()). Возвращает ссылку на замененный элемент
    var i, ind,eq,sub;
	eq = this.findFromScheme(a); //находим узел с выражением по схеме a
	sub = eq.fromScheme(a); //составляем массив
	
	eq.type = c.type;
	eq.eq1 = c.eq1;
	if (c.eq2) eq.eq2 = c.eq2;
	if (c.f) eq.f = c.f; 
	
	for (i = 0; i < sub.vars.length; i++) {
		c = eq.substitute(sub.vars[i], sub.eqs[i]);
		eq.type = c.type;
		eq.eq1 = c.eq1;
		if (c.eq2) eq.eq2 = c.eq2;
		if (c.f) eq.f = c.f; 
	}
    return eq;
}

Equation.prototype.fromScheme = function(sch) { //возвращает Subst, если this = sch(g()) и null если нет
	var s1, s2;
	if (sch.type == 's') {
		if (sch.eq1.type == 'v') return new Subst([sch.eq1.name], [this]);
		else if(this.type =='s' && sch.eq1.name == this.eq1.name) return Subst([], []);
		else return null;
	}
	else {
		if (sch.type != this.type) return null;
		if (sch.type == 'fun' && this.f != sch.f) return null;
		s1 = this.eq1.fromScheme(sch.eq1);
		if(sch.type !='fun' && sch.type != 'par' && sch.type != 'neg'){
			s2 = this.eq2.fromScheme(sch.eq2);
			if (s1 && s2) {
				s1 = s1.join(s2);
				return s1;
			}
		}
		else return s1;
	}
}

Equation.prototype.findFromScheme = function(sch) { //возвращает equation, соответствующий схеме
	if (this.fromScheme(sch)) return this;
	var eq = this.eq1.findFromScheme(sch);
	if (eq) return eq;
	return this.eq2.findFromScheme(sch);
}

Subst.prototype.join = function(b) { //проверка двух Subst объектов на конфликт и возврат объединения
	var i, j, n;
	var c = new Subst(this.vars, this.eqs);
	n = this.vars.length;
	for (i = 0; i < n; i++) {
		j = b.vars.indexOf(this.vars[i]);
		console.log('i: '+i +'; j: ' +j+'this.vars[i]'+this.vars[i]);
		console.log('this.eqs[i]: '+this.eqs[i]);
		if ( j >= 0 && !this.eqs[i].isEqual(b.eqs[j]) ) return null;
	}

	n = b.vars.length;
	for (i = 0; i < n; i++) {
		j = this.vars.indexOf(b.vars[i]);
		if ( j < 0) c.append(b.vars[i], b.eqs[i]);
	}
	return c;
}

Subst.prototype.append = function(v,e) {
	this.vars.push(v);
	this.eqs.push(e);
}

//!!!!!!!!!!!!__________OTHER TRANSFORMATIONS__________________!!!!!!!!!!!!!!!!
Equation.prototype.normalizeangle = function(){
		var a = this.todeg().eq1.name;
		var k = Math.floor(a/360);
		return a - k * 360;
}

Equation.prototype.quarter = function()
{
		var a = this.normalizeangle();
		if (a == 0 || a == 90 || a == 270) return 0;
		else if (a < 90) return 1;
		else if (a < 180) return 2;
		else if (a < 270) return 3;
		else return 4;
}

Equation.prototype.todeg = function() //понимает pi / k, a * pi a/b * pi
{
	if(this.type == 's')
	{
		if (this.eq1.type == 'º')
			return this;
		else if (this.eq1.name == 'pi')
			return eqFromSym(new Symbol('180º'));
		else
			return eqFromSym(new Symbol((this.value()*180/Math.PI).toFixed(2)-0,"º"));
	}
	
	else
		return eqFromSym(new Symbol((this.value()*180/Math.PI).toFixed(2)-0,"º"));
}

Equation.prototype.torad = function()
{
	var _ = undefined;
	if (this.type == 's' && this.eq1.type == 'º')
	{
		if (Equation.spec360.indexOf(this.eq1.name-0) >= 0) { return parse(Equation.spec2pi[Equation.spec360.indexOf(this.eq1.name-0)]);}
		else return parse(this.eq1.name).div(parse('180')).mult(parse('pi')).simplify();
	}
	else if (this.type == 's') return this;
	else
		return new Equation(this.type, this.eq1.torad(), this.eq2 ? this.eq2.torad():_, this.f);
}

//!!!!!!!!!!!____________EVALUATION OF EQUATION_________________!!!!!!!!!!!!!!!!!
Equation.prototype.value = function(vars,values)
{
	var t = this.type;
	var arg, arg2 = null;
  try {
  	if (t == 's') arg = this.eq1.name;
  	else arg = this.eq1.value(vars,values);
  	if (arg == null) return null;
  	if (this.eq2) arg2 = this.eq2.value(vars,values);
  	if (arg2 == null && ['sum','dif','mul','div','pow'].indexOf(t) >=0) return null;
  	
	switch (t)
	{
		case 's':
		  var ts = this.eq1.type;
		  if (Symbol.stypes().indexOf(ts) < 0) throw new TypeError("Unknown symbol type: " + ts);
		  else 
		  { 
			switch (ts)
			{
				case "inf": return Infinity;
				case "d": return arg;
				case "f": return arg;
				case "v": 
					if (!vars || vars.indexOf(arg) < 0) throw new TypeError("Unknown variable: " + arg);
					else return values[vars.indexOf(arg)];
				case "c": return arg == 'pi' ? Math.PI : Math.E;
				case "º": return arg / 180 * Math.PI;
				default : throw new TypeError("Failed to evaluate symbol: " + ts);
			}
		  }
		  break;
		case "fun": 
			if (Equation.env().indexOf(this.f) < 0) throw new TypeError("Unknown function: " + this.f);
			else {
				switch (this.f)
				{
					case 'sin': return Math.sin(arg);
					case 'cos': return Math.cos(arg);
					case 'tg': return Math.tan(arg);
					case 'ctg': return 1/Math.tan(arg);
					case 'log': return Math.log(arg)/Math.log(10);
					case 'ln': return Math.log(arg);					
					case 'exp': return Math.exp(arg);
					case 'sqrt': return Math.sqrt(arg);					
					case 'abs':	return Math.abs(arg);
					case 'arccos': return Math.acos(arg);
					case 'arcsin': return Math.asin(arg);
					case 'arctg' : return Math.atan(arg);
					case 'arcctg' : return Math.atan(-arg)+Math.PI/2;
					default : throw new TypeError("Failed to evaluate the function: " + this.f);
				}
			}
			break;
		case "par": return arg;
		case "neg": return -arg;
		case "sum": return arg-(-this.eq2.value(vars,values));
		case 'dif': return arg-this.eq2.value(vars,values);
		case 'mul': return arg*this.eq2.value(vars,values);
		case 'div': return arg/this.eq2.value(vars,values);
		case 'pow': return Math.pow(arg,this.eq2.value(vars,values));
		default : throw new TypeError("Unexpected equation type: " + this.type);
	}
  }
  
  catch(err) {
    //console.log(err.message);
  	return null;
  }
}

/*Equation.prototype.seval = function(correct,vars,values) //returns symbolic representation of the equation
{
	var s = this.toString(); //заглушка, пока не написан свой метод
	nerdamer(s);
	s = nerdamer.equations(true, true)[nerdamer.length];
	if (!correct) s = s + 1; //заглушка
	return s;
}*/

var simplify = function(v)
{
	var eq = parse(v);
	console.log(v);//,eq.simplify().toTeX());
	return eq.simplify();
}

Equation.prototype.simplify = function()
{
	var ACC = 5;
	var known = ['sqrt(2)','sqrt(3)','sqrt(2)/2','sqrt(3)/2','sqrt(3)/3','pi/6','pi/4','pi/3','pi/2','(2*pi)/3','(3*pi)/4','(5*pi)/6','pi','(7*pi)/6','(5*pi)/4','(4*pi)/3','(3*pi)/2','(5*pi)/3','(7*pi)/4','(11*pi)/6','2*pi'];/*,
	'1/2',	'1/3',	'1/4',	'1/5',	'1/6',	'1/7',	'1/8',	'1/9',	'1/10',
			'2/3',			'2/5',			'2/7',			'2/9',
	'3/2',			'3/4',	'3/5',			'3/7',	'3/8',			'3/10',
			'4/3',			'4/5',			'4/7',			'4/9',
	'5/2',	'5/3',	'5/4',			'5/6',	'5/7',	'5/8',	'5/9',
	'6/2',					'6/5',			'6/7',
	'7/2',	'7/3',	'7/4',	'7/5',	'7/6',			'7/8',	'7/9',	'7/10',
			'8/3',			'8/5',			'8/7',			'8/9',
	'9/2',			'9/4',	'9/5',			'9/7',	'9/8',	'9/10',
	];*/
	
	var i, j,
	val = this.value();
  if (val != null) {
	console.log('Has value');
//Infinity
	if (val > Math.pow(10,ACC) || val < -Math.pow(10,ACC)) return eqFromSym(new Symbol('inf'));

//Integers
	if (isint(val)) return parse(round(val));

//Ratios
	if(this.type == 'div') {
		i = this.eq1.value();
		j = this.eq2.value();
		if (isint(i) && isint(j) ){
			//i = round(i); j = round(j);
			return parse(i/gcf(i,j) + ' / ' + j/gcf(i,j)); }
	}
//Full squares
	if (this.type == 'fun' && this.f == 'sqrt'  )
	{
		i = this.eq1.value();
		if(isint(i)) {
			j = fullSquare(i);
			if (j>1) return parse((j==1?'':j)+'*sqrt('+i/j/j+')'); }
	}
//equations with known values
	for (i = 0; i < known.length; i++)
	{
		var eq = parse(known[i]);
		if (round(eq.value() - val) == 0)   return eq;
		eq = parse('-'+known[i]);
		if (round(eq.value() - val) == 0)   return eq;
	}
	if (isint(val*100)) return parse(round(val,2));	
	//if (isint(val*1800)) return parse(round(val*180,0) + ' / 180');
//if something was in degrees, then convert to degrees
	if (this.type != 'fun' && ( this.eq1.type == 's' && this.eq1.eq1.type == 'º' || typeof(this.eq2) != 'undefined' && this.eq2.type == 's' && this.eq2.eq1.type == 'º') )
		return eqFromSym(new Symbol(round(val/Math.PI*180),'º')); 	
//other floats
	if (this.type == 's' && this.eq1.type == 'f') return eqFromSym(new Symbol(round(val)));
  }
  	console.log('Unknown value');
  	if (this.type == 's') return this;
//1*x
	if (this.type == 'mul' && this.eq1.type == 's' && this.eq1.eq1.name-0 == 1)
		return this.eq2.simplify();
//0-x
	if (this.type == 'dif' && this.eq1.type == 's' && this.eq1.eq1.name-0 == 0)
		return new Equation('neg',this.eq2.simplify());
//x-0
	if (this.type == 'dif' && this.eq2.type == 's' && this.eq2.eq1.name-0 == 0)
		return this.eq1.simplify();
//0+x
	if (this.type == 'sum' && this.eq1.type == 's' && this.eq1.eq1.name-0 == 0)
		return this.eq2.simplify();
//x+0
	if (this.type == 'sum' && this.eq2.type == 's' && this.eq2.eq1.name-0 == 0)
		return this.eq1.simplify();
//--
	if (this.type == 'dif' && this.eq2.type == 'neg')
		return new Equation('sum',this.eq1.simplify(),this.eq2.eq1.simplify());
//+-
	if (this.type == 'sum' && this.eq2.type == 'neg')
		return new Equation('dif',this.eq1.simplify(),this.eq2.eq1.simplify());
//*1/x, / (1/x)
	if (this.type == 'mul' && this.eq2.type == 'div' && this.eq1.name-0 == 1)
		return new Equation('div',this.eq1.simplify(),this.eq2.eq2.simplify());
	else if (this.type == 'div' && this.eq2.type == 'div' && this.eq2.eq1.name-0 == 1)
		return new Equation('mul',this.eq1.simplify(),this.eq2.eq2.simplify());	
//recursion	
	var _;
	
	if(this.eq2) _ = this.eq2.simplify();
	else _ = null;
	console.log('recursion');
	return new Equation(this.type,this.eq1.simplify(),_,this.f); //eqFromSym(new Symbol(val));
	
	function round(v,p){
		if (v == null || v == undefined) return v;
		if (p == undefined) p = ACC;
		return Math.floor(v*Math.pow(10,p)+0.5)/Math.pow(10,p);
	}
	
	function isint(v){ //checks if int up to accuracy
		if (v == null || v == undefined) return v;
		if (Math.abs(round(v,0)-v)<1/Math.pow(10,ACC)) return true;
		else return false;
	}
	
	function gcf(a,b){
		while (b != 0) {
                var t = b;
                b = a % b;
                a = t;
        }
	    return a;
	}
	
	function fullSquare(a){
		if (a == null || a == undefined) return a;
		var maxd = 1;
		for (var d = 1; d*d <= a; d++) {
			if (a % (d * d) == 0) maxd = d;
		}
		return maxd;
	}
}


//!!!!!!!!!!!!__________To TeX METHOD__________________________!!!!!!!!!!!!!!!!!!!

Equation.greeks = ['alpha','beta','gamma','delta','epsilon','kappa','lambda','ro','omega'];

Equation.prototype.toTeX = function(){
	var t = this.type;
	var arg,arg2;
	if(this.type != 's'){
	arg = this.eq1.toTeX();
	if (this.type == 'fun' && ['div','mul','s','par'].indexOf(this.eq1.type) < 0) arg = '\\left('+arg+'\\right)';
	arg2 = this.eq1.type == 'par' ? this.eq1.eq1.toTeX() : arg;}
	switch (t)
	{
		case 's':
		  var ts = this.eq1.type;
		  if (Symbol.stypes().indexOf(ts) < 0) throw new TypeError("Unknown symbol type: " + ts);
		  else 
		  { 
			arg = this.eq1.name;
			switch (ts)
			{
				case "d": return arg+' ';
				case "f": return Math.floor(arg*1e5+0.5)/1e5+' ';
				case "v": if (Equation.greeks.indexOf(arg) >= 0) return '\\'+arg+' ';
						else return arg+' ';
				case "inf": return '\\infty ';
				case "c": return arg == 'pi' ? '\\pi ' : 'e ';
				case "º": return arg+'^\\circ ';
				default : throw new TypeError("Failed to render symbol: " + ts);
			}
		  }
		case "fun": 
			if (Equation.env().indexOf(this.f) < 0) throw new TypeError("Unknown function: " + this.f);
			else {
				switch (this.f)
				{
					case 'sin': return '\\sin '+arg;
					case 'cos': return '\\cos '+arg;
					case 'tg': return '\\text{tg}'+arg;
					case 'ctg': return '\\text{ctg}'+arg;
					case 'log': return '\\log '+arg;
					case 'ln': return '\\ln '+arg;					
					case 'exp': return '\\e^{'+arg2+'}';
					case 'sqrt': return '\\sqrt{'+arg2+'} ';					
					case 'abs':	return '|'+arg+'|';
					case 'arccos': return '\\text{arccos}'+arg;
					case 'arcsin': return '\\text{arcsin}'+arg;
					case 'arctg' : return '\\text{arctg}'+arg;
					case 'arcctg' : return '\\text{arcctg}'+arg;
					default : throw new TypeError("Failed to evaluate the function: " + this.f);
				}
			}
		case "par": return '\\left('+arg+'\\right) ';
		case "neg": return '-'+arg;
		case "sum": return arg+' + '+ this.eq2.toTeX();
		case 'dif': return arg+' - '+ this.eq2.toTeX();
		case 'mul': if (this.eq1.type == 's' && ['c','v'].indexOf(this.eq1.eq1.type) >= 0 || this.eq2.type == 's' && ['c','v'].indexOf(this.eq2.eq1.type) >= 0 ) return arg+' '+ this.eq2.toTeX();
					else return arg+' \\cdot '+ this.eq2.toTeX();
		case 'div': return '\\frac{'+arg2+'}{'+ (this.eq2.type == 'par'? this.eq2.eq1.toTeX(): this.eq2.toTeX())+'}';
		case 'pow': 
			if (this.eq1.type == 'fun')
				return '\\text{'+this.eq1.f+'}' + '^{'+(this.eq2.type == 'par'? this.eq2.eq1.toTeX(): this.eq2.toTeX())+'}\\left('+this.eq1.eq1.toTeX()+'\\right)';
			else
				return arg+' ^{'+ (this.eq2.type == 'par'? this.eq2.eq1.toTeX(): this.eq2.toTeX())+'}';
		default : throw new TypeError("Unexpected equation type: " + this.type);
	}

}




//!!!!!!!!!!!!___________HELPER METHODS_________________________!!!!!!!!!!!!!!!!

Array.prototype.unique = function() { //возвращает массив из уникальных элементов
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

function multipleEntry(array) { //возвращает массив из повторяющихся элементов
    var a = []; //repeated elements
    for(var i=0; i<array.length; ++i)
    	if (numEntry(array,array[i]) > 1 && numEntry(a,array[i]) == 0) a.push(array[i]);
    return a;
};

function numEntry(array,el) { //возвращает количество вхождений элемента в массив
	var n = 0;
    for(var i=0; i<array.length; ++i)
            if(array[i] === el) n++;
    return n;
};

Array.prototype.getRandom = function() { //возвращает случайный элемент массива
	if (this[0] != 'range') return this[Math.floor(Math.random()*this.length)];
	else
	try{
		if (!this[3]) throw new TypeError("Step is required");
		return Math.floor(Math.random()*(this[2]-this[1])/this[3])*this[3]+this[1];
	}
	catch (err)
	{
		console.log(err.message);
		return this[1];
	}
}

String.prototype.katexrus = function(){ //
 return this.replace(/\\tan/g,'\\text\{tg\}').replace(/\\cot/g,'\\text\{ctg\}').replace(/\\acos/g,'\\text\{arccos\}').replace(/\\asin/g,'\\text\{arcsin\}').replace(/\\atan/g,'\\text\{arctg\}').replace(/\\acot/g,'\\text\{arcctg\}');
}

String.prototype.rusnerd = function(){
 return this.replace(/ctg/g,'cot').replace(/tg/g,'tan').replace(/arccos/g,'acos').replace(/arcsin/g,'asin').replace(/arctg/g,'atan').replace(/arcctg/g,'acot');
}

String.prototype.revType = function(){ //возвращает обратную операцию
	if (this == 'dif') return 'sum';
	if (this == 'div') return 'mul';
	if (this == 'mul') return 'div';
	if (this == 'sum') return 'dif';
}

String.prototype.mulsum = function(){ //true если тип + или *
	if (this == 'mul' || this == 'sum') return true;
	else return false;
}


String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
}

function random(n){
return Math.floor(Math.random()*n);
}

//!!!!!!!!!!!_______________PARSING__________________________!!!!!!!!!!!!!!!!!!!!!

/*Регулярные выражения:
	содержит = : /=/
	является именем функции: /^[a-z]+\d*$/
	является функцией от выражения: /^[a-z]+\d*(\w*)$/
	является выражением в скобках: /(.*)/ */
	
function parse(str) {
	if (typeof(str) =='number' && Math.abs(str)<1e-6) return parse('0');
	if ( str == '' ) return null;
	str = /\S.*\S|\S/.exec(str)[0]; //убираем пробельные символы
	
	if(!parentheses(str)) return null;
	
	var eq, eq1, eq2, i;
	
	if(/=/.test(str)) { 	//равенство -> возвращаем identity
		i = /=/.exec(str).index;
		var iden = new Identity(
			parse(str.slice(0,i)),
			parse(str.slice(i+1,str.length)),
			true //по умолчанию identity, полученное из строки верно
			);
		return iden;
	}
	else if (/^[a-z]+\d*$|^\d+º?$|^\d*\.\d*$/.test(str)) {
		eq = eqFromSym(new Symbol(str));
		return eq;
	}
	else if (/^[a-z]+\d*\(.*\)$/.test(str)) { //функция
		i = /\(/.exec(str).index;
		eq = new Equation('fun', parse(str.slice(i+1,str.length-1)),undefined ,str.slice(0,i));
		if(eq && eq.toString()!='') return eq;
	}
	if (/^\(.*\)$/.test(str) && parentheses(str.slice(1,str.length-1))) { //скобки
		eq = new Equation('par', parse(str.slice(1,str.length-1)));
		return eq;
	}
	else  {
		for (i = 0; i < str.length; i++){
			if (str[i] == '+') {
				eq1 = parse(str.slice(0,i));
				eq2 = parse(str.slice(i+1,str.length));
				if (eq1 && eq2) { eq = new Equation('sum',eq1,eq2); return eq; }
			}
			else if (str[i] == '-') {
				eq2 = parse(str.slice(i+1,str.length));
				if (i == 0 && eq2)
					if (eq2.type != 'dif' && eq2.type != 'sum')
						{eq = new Equation('neg',eq2); return eq;}
				eq1 = parse(str.slice(0,i));
				if (eq1 && eq2) 
					if (eq2.type != 'dif' && eq2.type != 'sum') 
						{ eq = new Equation('dif',eq1,eq2); return eq; }
			}
			else if (str[i] == '*') {
				eq1 = parse(str.slice(0,i));
				eq2 = parse(str.slice(i+1,str.length));
				if (eq1 && eq2) 
					if (eq1.type != 'dif' && eq1.type != 'sum' && eq2.type != 'dif' && eq2.type != 'sum') 
						{ eq = new Equation('mul',eq1,eq2); return eq; }
			}
			else if (str[i] == '/') {
				eq1 = parse(str.slice(0,i));
				eq2 = parse(str.slice(i+1,str.length));
				if (eq1 && eq2) 
					if (eq1.type != 'dif' && eq1.type != 'sum' && 
						(eq2.type == 's' || eq2.type == 'pow' || eq2.type == 'fun' || eq2.type == 'par')) 
						{ eq = new Equation('div',eq1,eq2); return eq; }
			}
			else if (str[i] == '^') {
				eq1 = parse(str.slice(0,i));
				eq2 = parse(str.slice(i+1,str.length));
				if (eq1 && eq2) 
					if ((eq1.type == 'par'||eq1.type == 'fun'||eq1.type =='s') && 
						(eq2.type == 'par'||eq2.type == 'fun'||eq2.type =='s'||eq2.type =='pow')) 
						{ eq = new Equation('pow',eq1,eq2); return eq; }
			}
		} 
	}
	return null;
}

function parentheses(str) { //возвращает true при равенстве правых и левых скобок
	var i, o = 0, c = 0;
	for (i=0; i < str.length; i++) {
		if (str[i] == '(') o++;
		else if (str[i] == ')') c++;
		if (c > o) return null;
	}
	return c == o;
}

//!!!!!!!!!!!!!!!!!____________CONVERTER TO JS FUNCTIONS______________________!!!!!!!!!!!!!!!!!!!!!!
Equation.toJS = function(){
	var t = this.type;
	var arg,arg2;
	if(this.type != 's'){arg = this.eq1.toTeX();
	arg2 = this.eq1.type == 'par' ? this.eq1.eq1.toTeX() : arg;}
	switch (t)
	{
		case 's':
		  var ts = this.eq1.type;
		  if (Symbol.stypes().indexOf(ts) < 0) throw new TypeError("Unknown symbol type: " + ts);
		  else 
		  { 
			arg = this.eq1.name;
			switch (ts)
			{
				case "d": return arg+' ';
				case "f": return Math.floor(arg*1e5+0.5)/1e5+' ';
				case "v": if (Equation.greeks.indexOf(arg) >= 0) return '\\'+arg+' ';
						else return arg+' ';
				case "inf": return '\\infty ';
				case "c": return arg == 'pi' ? '\\pi ' : 'e ';
				case "º": return arg+'^\\circ ';
				default : throw new TypeError("Failed to render symbol: " + ts);
			}
		  }
		case "fun": 
			if (Equation.env().indexOf(this.f) < 0) throw new TypeError("Unknown function: " + this.f);
			else {
				switch (this.f)
				{
					case 'sin': return '\\sin '+arg;
					case 'cos': return '\\cos '+arg;
					case 'tg': return '\\text{tg}'+arg;
					case 'ctg': return '\\text{ctg}'+arg;
					case 'log': return '\\log '+arg;
					case 'ln': return '\\ln '+arg;					
					case 'exp': return '\\e^{'+arg2+'}';
					case 'sqrt': return '\\sqrt{'+arg2+'} ';					
					case 'abs':	return '|'+arg+'|';
					case 'arccos': return '\\text{arcsin}'+arg;
					case 'arcsin': return '\\text{arccos}'+arg;
					case 'arctg' : return '\\text{arctg}'+arg;
					case 'arcctg' : return '\\text{arcctg}'+arg;
					default : throw new TypeError("Failed to evaluate the function: " + this.f);
				}
			}
		case "par": return '\\left('+arg+'\\right) ';
		case "neg": return '-'+arg;
		case "sum": return arg+' + '+ this.eq2.toTeX();
		case 'dif': return arg+' - '+ this.eq2.toTeX();
		case 'mul': if (this.eq1.type == 's' && ['c','v'].indexOf(this.eq1.eq1.type) >= 0 || this.eq2.type == 's' && ['c','v'].indexOf(this.eq2.eq1.type) >= 0 ) return arg+' '+ this.eq2.toTeX();
					else return arg+' \\cdot '+ this.eq2.toTeX();
		case 'div': return '\\frac{'+arg2+'}{'+ (this.eq2.type == 'par'? this.eq2.eq1.toTeX(): this.eq2.toTeX())+'}';
		case 'pow': 
			if (this.eq1.type == 'fun')
				return this.eq1.f + '^{'+(this.eq2.type == 'par'? this.eq2.eq1.toTeX(): this.eq2.toTeX())+'}\\left('+this.eq1.eq1.toTeX()+'\\right)';
			else
				return arg+' ^{'+ (this.eq2.type == 'par'? this.eq2.eq1.toTeX(): this.eq2.toTeX())+'}';
		default : throw new TypeError("Unexpected equation type: " + this.type);
	}
}

//!!!!!!!!!!!!!______________CONSTRUCTORS FOR PROBLEMS________________________!!!!!!!!!!!!!!!!!!!!!

Equation.trigIdentity = function(type,n){
	var types = ['sameargument','sums', 'doublearg', 'halfarg', 'tgx2', 'sumtomul', 'multosum', 'prived'];
	
	if (type == undefined) type = types.getRandom();
	
	var sameargument = ['tg(x)=sin(x)/cos(x)', 'ctg(x)=cos(x)/sin(x)','tg(x)*ctg(x)=1', 'sin(x)^2+cos(x)^2=1', 'tg(x)^2+1=1/cos(x)^2','ctg(x)^2+1=1/sin(x)^2'],
	
		sumargsincos = ['sin(x+y)=sin(x)*cos(y)+cos(x)*sin(y)','sin(x-y)=sin(x)*cos(y)-cos(x)*sin(y)',
			'cos(x+y)=cos(x)*cos(y)-sin(x)*sin(y)','cos(x-y)=cos(x)*cos(y)+sin(x)*sin(y)'],
			
		sumargtgctg = ['tg(x+y)=(tg(x)+tg(y))/(1-tg(x)*tg(y))','tg(x-y)=(tg(x)-tg(y))/(1+tg(x)*tg(y))',
			'ctg(x+y)=(ctg(x)*ctg(y)-1)/(ctg(x)+ctg(y))','ctg(x-y)=(ctg(x)*ctg(y)+1)/(ctg(x)-ctg(y))'],

		sumargtg = ['tg(x+y)=(tg(x)+tg(y))/(1-tg(x)*tg(y))','tg(x-y)=(tg(x)-tg(y))/(1+tg(x)*tg(y))'],
		
		sumargctg = ['ctg(x+y)=(ctg(x)*ctg(y)-1)/(ctg(x)+ctg(y))','ctg(x-y)=(ctg(x)*ctg(y)+1)/(ctg(x)-ctg(y))'],
		
		doublearg = ['sin(2*x)=2*sin(x)*cos(x)','cos(2*x)=cos(x)^2-sin(x)^2',
			'cos(2*x)=1-2*sin(x)^2', 'cos(2*x)=2*cos(x)^2-1',
			'tg(2*x)=(2*tg(x))/(1-tg(x)^2)',
			'ctg(2*x)=(ctg(x)^2-1)/(2*ctg(x))'],
		halfarg = ['sin(x/2)^2=(1-cos(x))/2','cos(x/2)^2=(1+cos(x))/2','tg(x/2)=sin(x)/(1+cos(x))','tg(x/2)=(1-cos(x))/sin(x)',
		'ctg(x/2)=sin(x)/(1-cos(x))','ctg(x/2)=(1+cos(x))/sin(x)'],
		
		tgx2 = ['sin(x)=(2*tg(x/2))/(1+tg(x/2)^2)','cos(x)=(1-tg(x/2)^2)/(1+tg(x/2)^2)','tg(x)=(2*tg(x/2))/(1-tg(x/2)^2)'],
		
		sumtomul = ['sin(x)+sin(y)=2*sin((x+y)/2)*cos((x-y)/2)','sin(x)-sin(y)=2*cos((x+y)/2)*sin((x-y)/2)',
			'cos(x)+cos(y)=2*cos((x+y)/2)*cos((x-y)/2)','cos(x)-cos(y)=2*sin((x+y)/2)*sin((x-y)/2)',
			'tg(x)+tg(y)=sin(x+y)/(cos(x)*cos(y))','tg(x)-tg(y)=sin(x-y)/(cos(x)*cos(y))'
		],
		
		sumtomulsincos = ['sin(x)+sin(y)=2*sin((x+y)/2)*cos((x-y)/2)','sin(x)-sin(y)=2*cos((x+y)/2)*sin((x-y)/2)',
			'cos(x)+cos(y)=2*cos((x+y)/2)*cos((x-y)/2)','cos(x)-cos(y)=2*sin((x+y)/2)*sin((x-y)/2)'
		],

		sumtomultgctg = ['tg(x)+tg(y)=sin(x+y)/(cos(x)*cos(y))','tg(x)-tg(y)=sin(x-y)/(cos(x)*cos(y))',
		'ctg(x)+tg(y)=sin(x+y)/(sin(x)*sin(y))','ctg(x)-ctg(y)=-sin(x-y)/(sin(x)*sin(y))'
		],
		
		multosum = ['sin(x)*sin(y)=1/2*(cos(x-y)-cos(x+y))', 'cos(x)*cos(y)=1/2*(cos(x-y)+cos(x+y))',
			'sin(x)*cos(y)=1/2*(sin(x-y)+sin(x+y))'
		],
		
		prived = ['sin(-x)=-sin(x)','cos(-x)=cos(x)','tg(-x)=-tg(x)','ctg(-x)=-ctg(x)',
			'sin(pi-x)=sin(x)','cos(pi-x)=-cos(x)','tg(pi-x)=-tg(x)','ctg(pi-x)=-ctg(x)',
			'sin(pi+x)=-sin(x)','cos(pi+x)=-cos(x)','tg(pi+x)=tg(x)','ctg(pi+x)=ctg(x)',
			'sin(pi/2-x)=cos(x)','cos(pi/2-x)=sin(x)','tg(pi/2-x)=ctg(x)','ctg(pi/2-x)=tg(x)',
			'sin(pi/2+x)=cos(x)','cos(pi/2+x)=-sin(x)','tg(pi/2+x)=-ctg(x)','ctg(pi/2+x)=-tg(x)',
			'sin(3/2*pi-x)=-cos(x)','cos(3/2*pi-x)=-sin(x)','tg(3/2*pi-x)=ctg(x)','ctg(3/2*pi-x)=tg(x)',
			'sin(3/2*pi+x)=-cos(x)','cos(3/2*pi+x)=sin(x)','tg(3/2*pi+x)=-ctg(x)','ctg(3/2*pi+x)=-tg(x)'
		]
		;
	
	var a;	
	switch(type)
	{
		case 'sameargument': a = sameargument; break;
		case 'sumargsincos': a = sumargsincos; break;
		case 'sumargtgctg': a = sumargtgctg; break;
		case 'sumargtg': a = sumargtg; break;
		case 'sumargctg': a = sumargctg; break;
		case 'doublearg': a = doublearg; break;
		case 'halfarg': a = halfarg; break;
		case 'tgx2': a = tgx2; break;
		case 'sumtomul': a = sumtomul; break;
		case 'sumtomultgctg': a = sumtomultgctg; break;
		case 'sumtomulsincos': a = sumtomulsincos; break;		
		case 'multosum': a = multosum; break;
		case 'prived': a = prived; break;
	}
	
	if (n == undefined) return a.getRandom();
		else return a[n];
	
}

var randomFraction = function(type){
	var types = ['n2346','k/2'],
		n2346 = ['1/2','1/3','2/3','1/4','3/4','1/6','5/6'],
		k_2 = ['1/2','1','3/2','2'];
	var eq;
	
	if (!type) { type = types.getRandom(); }
	
	switch (type)
	{
		case 'n2346': return parse( n2346.getRandom() );
		case 'k/2': return parse( k_2.getRandom() );
	}
	return eq;
}

var randomAngle = function(type){ //returns equation
	var types = ['90','180','360','720','±90','±180','±360','±720',
		//'!90','x45','x30','x90','x45!90','x30!90',
		'alpha','alpha/a','a/b alpha','pi/a','a/b pi', 'a/b alpha ± c/d pi'];
	var denom = ['2','3','4','6'];
	
	if (!type) { type = types.getRandom(); }
	
	var eq, eq1, eq2;
	
	switch (type)
	{
		case '90': eq = parse((Math.random()*90).toFixed(0)); break;
		case '180': eq = parse((Math.random()*180).toFixed(0)); break;
		case '360': eq = parse((Math.random()*360).toFixed(0)); break;
		case '720': eq = parse((Math.random()*720).toFixed(0)); break;
		case '±90': eq = parse((Math.random()*180-90).toFixed(0)); break;
		case '±180': eq = parse((Math.random()*360-180).toFixed(0)); break;
		case '±360': eq = parse((Math.random()*720-360).toFixed(0)); break;
		case '±720': eq = parse((Math.random()*1440-720).toFixed(0)); break;
		
		case 'alpha': eq = eqFromSym(randomSymbol('v')); break;
		case 'alpha/a': eq = new Equation( 'div',eqFromSym(randomSymbol('v')),new Symbol(denom.getRandom()) ); break;
		case 'a/b alpha': eq = new Equation('mul',randomFraction('n2346'),eqFromSym(randomSymbol('v'))); break;
		case 'pi/a': eq = new Equation( 'div',eqFromSym(new Symbol('pi')),new Symbol(denom.getRandom()) ); break;
		case 'k/2 pi': eq = new Equation( 'mul',randomFraction('k/2'),eqFromSym(new Symbol('pi')) ); break;
		case 'a/b pi': eq = new Equation( 'mul',randomFraction('n2346'),eqFromSym(new Symbol('pi')) ); break;
		case 'a/b alpha ± c/d pi': 
					if (Math.floor(Math.random()*2)) { 
						eq = new Equation('sum',randomAngle('a/b alpha'),randomAngle('a/b pi') ); }
					else { 
						eq = new Equation('dif',randomAngle('a/b alpha'),randomAngle('a/b pi') ); }
					break;
		case 'alpha + k/2 pi':
					if (Math.floor(Math.random()*2)) { 
						eq = new Equation('sum',randomAngle('alpha'),randomAngle('k/2 pi') ); }
					else { 
						eq = new Equation('dif',randomAngle('alpha'),randomAngle('k/2 pi') ); }
					break;
		default: eq = parse('0'); break;
	}
	return eq;
}

Equation.spec360 = [0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330,360];
Equation.spec2pi = ['0','pi/6','pi/4','pi/3','pi/2','(2*pi)/3','(3*pi)/4','(5*pi)/6','pi','(7*pi)/6','(5*pi)/4','(4*pi)/3','(3*pi)/2','(5*pi)/3','(7*pi)/4','(11*pi)/6','2*pi'];
Equation.specxpi2 =
['pi/6','pi/4','pi/3','(2*pi)/3','(5*pi)/6','(7*pi)/6','(5*pi)/4','(4*pi)/3','(5*pi)/3','(7*pi)/4','(11*pi)/6'];

Equation.PTriple = [[3,4,5], [12,5,13], [8,15,17], [7,24,25]];


Equation.triangle = function(type){
	var types = ['PTriple', 'intCatet', 'intHep'];
	if (!type) { type = types.getRandom(); }
	else if (typeof(type) == 'object') { type = type.getRandom(); }
	
var	coefs = [0.1,1,2,3,10];
	
	var eqs = [];
	console.log(type);
	switch (type)
	{
		case 'PTriple': 
			eqs = Equation.PTriple.getRandom();
			var c = coefs.getRandom();
			eqs[0] = parse(eqs[0] * c);
			eqs[1] = parse(eqs[1] * c);
			eqs[2] = parse(eqs[2] * c); break;
		case 'intCatet': 
			eqs[0] = parse(random(7) + 3);
			eqs[1] = parse(random(7) + 3);
			eqs[2] = parse('sqrt('+(eqs[0]*eqs[0]+eqs[1]*eqs[1])+')');
			console.log(eqs[2].toString());
			break;
		case 'intHep':
			eqs[2] = parse(random(5) + 10);
			eqs[0] = parse(random(7) + 3);
			eqs[1] = parse('sqrt('+(eqs[2]*eqs[2]-eqs[0]*eqs[0])+')');
			console.log(eqs[1].toString());
			break;
		default: throw new TypeError('Unknown type of rectangular Triangle'+ type); break;
	}
	console.log(eqs[0].simplify(), eqs[1].simplify(), eqs[2].simplify());
	return eqs;
	
	function mul(a,c){
		var s = 0
		for (var i = 0; i < a.length; i++)
			a[i] *= c;
		return a;
	}
	
}


Equation.angle = function(type){ //returns equation
	var types = ['90','180','360','720','±90','±180','±360','±720',
		'x45','x30','x90','5',
		//'!90','x45!90','x30!90',
		'alpha','alpha/a','a/b alpha','pi/a','a/b pi', 'a/b alpha ± c/d pi'];
	var denom = ['2','3','4','6'];
	
	if (!type) { type = types.getRandom(); }
	else if (typeof(type) == 'object') { type = type.getRandom(); }
	
	var eq, eq1, eq2;
	
	switch (type)
	{
		case '90': eq = parse((Math.random()*90).toFixed(0) + 'º'); break;
		case '180': eq = parse((Math.random()*180).toFixed(0) + 'º'); break;
		case '360': eq = parse((Math.random()*360).toFixed(0) + 'º'); break;
		case '720': eq = parse((Math.random()*720).toFixed(0) + 'º'); break;
		case '±90': eq = parse((Math.random()*180-90).toFixed(0) + 'º'); break;
		case '±180': eq = parse((Math.random()*360-180).toFixed(0) + 'º'); break;
		case '±360': eq = parse((Math.random()*720-360).toFixed(0) + 'º'); break;
		case '±720': eq = parse((Math.random()*1440-720).toFixed(0) + 'º'); break;
		
		case 'x30': eq = parse([30,60,120,150].getRandom() + 'º'); break;
		case 'x45': eq = parse([0,45,90,135,180].getRandom() + 'º'); break;
		case 'x90': eq = parse([0,90,180,270,360].getRandom() + 'º'); break;
		case '5': eq = parse([1,2,3,4,5].getRandom()); break;
		
		case 'spec360': eq = parse(Equation.spec360.getRandom() + 'º'); break;
		case 'spec180': eq = parse(Equation.spec360.slice(1,9).getRandom() + 'º'); break;
		case 'spec2pi': eq = parse(Equation.spec2pi.getRandom()); break;
		case 'spec180': eq = parse(Equation.spec2pi.slice(1,9).getRandom() + 'º'); break;
		case 'specxpi2': eq = parse(Equation.specxpi2.getRandom()); break;
				
		case 'alpha': eq = eqFromSym(randomSymbol('v')); break;
		case 'alpha/a': eq = new Equation( 'div',eqFromSym(randomSymbol('v')),new Symbol(denom.getRandom()) ); break;
		case 'a/b alpha': eq = new Equation('mul',randomFraction('n2346'),eqFromSym(randomSymbol('v'))); break;
		case 'pi/a': eq = new Equation( 'div',eqFromSym(new Symbol('pi')),new Symbol(denom.getRandom()) ); break;
		case 'k/2 pi': eq = new Equation( 'mul',randomFraction('k/2'),eqFromSym(new Symbol('pi')) ); break;
		case 'a/b pi': eq = new Equation( 'mul',randomFraction('n2346'),eqFromSym(new Symbol('pi')) ); break;
		case 'a/b alpha ± c/d pi': 
					if (Math.floor(Math.random()*2)) { 
						eq = new Equation('sum',randomAngle('a/b alpha'),randomAngle('a/b pi') ); }
					else { 
						eq = new Equation('dif',randomAngle('a/b alpha'),randomAngle('a/b pi') ); }
					break;
		case 'alpha + k/2 pi':
					if (Math.floor(Math.random()*2)) { 
						eq = new Equation('sum',randomAngle('alpha'),randomAngle('k/2 pi') ); }
					else { 
						eq = new Equation('dif',randomAngle('alpha'),randomAngle('k/2 pi') ); }
					break;
		default: throw new TypeError('Unknown type for angles: '+ type); break;
	}
	return eq;
}

Equation.trigfun = function(id)
{
	var names = ['sin','cos','tg','ctg'];
	if (!id) id = names.getRandom();
	if (typeof(id) == 'object') id = id.getRandom();
	var _ = undefined;
	return new Equation('fun',eqFromSym(new Symbol('x')),_,id);
}

Equation.invtrigfun = function(id)
{
	var names = ['arcsin','arccos','arctg','arcctg'];
	if (!id) id = names.getRandom();
	if (typeof(id) == 'object') id = id.getRandom();
	var _ = undefined;
	return new Equation('fun',eqFromSym(new Symbol('x')),_,id);
}

var trigProblem = function(type,angletype) { //берет случайное равенство из массива, подставляет случайны символьный угол и применяет к ней случайную трансформацию
	var iden = parse(trigIdentity(type));
	//console.log('попытка отображения задачи',iden.toString());
	var eq;
	var vars = iden.eq1.listVars().concat(iden.eq2.listVars());
	var uniquevars = vars.unique();
	var i, n = uniquevars.length;
	for (i = 0; i < n; i++)
	{
		eq = randomAngle(angletype);
		iden = iden.substitute(uniquevars[i],eq);
	}
	
	iden = iden.transform();
	return iden;
}
