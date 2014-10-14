Equation
========
This is a WIP library that I created to simplify the process of creation of algebra problems.
With this library you can easily parse, symbolically simplify, numerically evaluate mathematical equations and convert them to TeX (to use with MathJax or KATEX). Compared to Math.js this library allows you to simplify equations, e.g. parse('sin(45º)').simplify().toTeX() produces '\\frac{\\sqrt{2}}{2}', while parse('sin(35º)').simplify().toTeX() produces '\\sin 35^\circ'. Also there is a mechanism to create more complex equations by substituting variable with another equation.

Basic usage
=========
eq = parse ('sin(6/8*x)')  //produces object of type Equation

eq1 = eq.simplify()       //simplifies equation by simplifying fraction to 3/4

eq1.toString()            //produces "sin(3 / 4 * x)"

eq1.toTeX()               //produces "\sin \frac{3 }{4 } x "

angle = parse('60º')      //produces object of type Equation with one node of type Symbol

eq2 = eq1.substitute('x',angle); //substitutes variable 'x' in the equation with equation 'angle'

eq2.toTeX()               //produces "\sin \frac{3 }{4 } \cdot 60^\circ "

eq2.value()               //produces 0.5

There are 3 types of objects in this library: Symbol, Equation and Identity. Symbol has 2 properties: 'type' and 'name' and can be a number, an angle in degrees, a variable or a constant (pi or e). Equation is an object formed as a tree from other equations or symbols. Each node contains 2 obligatory fields: 'type' and 'eq1', and 2 optional: 'eq2' and 'fun'. Identity has properties 'eq1' and 'eq2'. E.g. parse('sin(2*x) = 2*sin(x)*cos(x)' produces Identity with 2 properties, containing right and left side of this identity.
