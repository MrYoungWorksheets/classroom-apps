// FULL FILE REPLACEMENTS
// Copy each section into the matching GitHub file.

// ===== problems.js =====

const GRAPH_PROMPT = 'Complete the graph features below. Use the dropdowns and short inputs instead of freehand graphing.';
const graphHowTo = 'Identify the parent family, then list the features that control the graph: domain, range, asymptotes, and key point.';
const graphWatch = 'Use interval notation carefully. Asymptotes are lines the graph approaches, not points on the graph.';
const solveHowTo = 'Choose an algebraic method, solve step by step, and check restrictions or extraneous solutions when the equation type requires it.';

window.TOPICS = [
  {id:'parent-functions', title:'Parent Function Graphs', pageGroup:'1', description:'Parent graphs, domain/range, and asymptotes.'},
  {id:'transformed-graphs', title:'Transformed Graphs', pageGroup:'2', description:'Feature-based checks for transformed parent functions.'},
  {id:'equation-solving', title:'Equation Solving', pageGroup:'3', description:'Solve for real solutions and check restrictions.'},
  {id:'log-exp-solving', title:'Log and Exponential Solving', pageGroup:'4', description:'Use logarithms and round to three decimals.'},
  {id:'function-composition', title:'Function Composition', pageGroup:'5', description:'Evaluate numeric and symbolic compositions.'},
  {id:'systems', title:'Systems of Equations', pageGroup:'6', description:'Solve linear, nonlinear, and three-variable systems.'},
  {id:'final-summary', title:'Final Summary', pageGroup:'summary', description:'View completion, help, and retry recommendations.'}
];

window.PROBLEMS = [
  ...[
    ['1a',String.raw`\(y = x\)`,['parent function','linear','domain','range'],'g-1a'],
    ['1b',String.raw`\(y = |x|\)`,['parent function','absolute value','domain','range'],'g-1b'],
    ['1c',String.raw`\(y = x^2\)`,['parent function','quadratic','domain','range'],'g-1c'],
    ['1d',String.raw`\(y = x^3\)`,['parent function','cubic','domain','range'],'g-1d'],
    ['1e',String.raw`\(y = \sqrt{x}\)`,['parent function','square root','domain','range'],'g-1e'],
    ['1f',String.raw`\(y = \sqrt[3]{x}\)`,['parent function','cube root','domain','range'],'g-1f'],
    ['1g',String.raw`\(y = \frac{1}{x}\)`,['parent function','rational','reciprocal','domain','range','asymptotes'],'g-1g'],
    ['1h',String.raw`\(y = \frac{1}{x^2}\)`,['parent function','rational','reciprocal squared','domain','range','asymptotes'],'g-1h'],
    ['1i',String.raw`\(y = 2^x\)`,['parent function','exponential','domain','range','asymptotes'],'g-1i'],
    ['1j',String.raw`\(y = \log_2(x)\)`,['parent function','logarithmic','domain','range','asymptotes'],'g-1j']
  ].map(([id,prompt,tags,gid]) => ({id, originalLabel:id, appNumber:id, topic:'Parent Function Graphs', pageGroup:'1', skillTags:tags, prompt:`Graph ${prompt} without a calculator.\n${GRAPH_PROMPT}`, answerType:'graphFeatures', answerFormat:'Enter domain, range, asymptotes if any, and the key point/shape feature.', howTo:graphHowTo, watchOut:graphWatch, hint1:'Start with the parent function shape and ask which x-values and y-values are possible.', hint2:'Use the feature labels in the input area. If there is no asymptote, write “none”.', solutionId:`s-${id}`, graphFeatureId:gid, validatorStub:'graphFeaturesStage2'})),
  ...[
    ['2a',String.raw`\(y = x^2 + 4x + 3\)`,['transformed graph','quadratic','vertex','intercepts','domain','range'],'g-2a'],
    ['2b',String.raw`\(y = -|x - 2| + 4\)`,['transformed graph','absolute value','vertex','reflection','domain','range'],'g-2b'],
    ['2c',String.raw`\(y = \log_2(x - 3)\)`,['transformed graph','logarithmic','shift','asymptote','domain','range'],'g-2c'],
    ['2d',String.raw`\[y = \frac{1}{x + 4}\]`,['transformed graph','rational','reciprocal','shift','asymptotes','domain','range'],'g-2d'],
    ['2e',String.raw`\(y = -\sqrt{x} + 1\)`,['transformed graph','square root','reflection','starting point','domain','range'],'g-2e'],
    ['2f',String.raw`\(y = (x + 1)^3\)`,['transformed graph','cubic','shift','domain','range'],'g-2f']
  ].map(([id,prompt,tags,gid]) => ({id, originalLabel:id, appNumber:id, topic:'Transformed Graphs', pageGroup:'2', skillTags:tags, prompt:`Graph ${prompt} without a calculator.\n${GRAPH_PROMPT}`, answerType:'graphFeatures', answerFormat:'Use the dropdowns and checkboxes for transformations. Then enter the key graph features.', howTo:'Compare the function to its parent graph and track shifts, reflections, vertices/starting points, and asymptotes.', watchOut:'A sign inside the function usually shifts left/right in the opposite-looking direction.', hint1:'Name the parent function first, then locate the anchor point or asymptote.', hint2:'For quadratics use the vertex formula; for logs/rationals set the inside or denominator equal to zero for vertical asymptotes.', solutionId:`s-${id}`, graphFeatureId:gid, validatorStub:'graphFeaturesStage2'})),
  {id:'3a', originalLabel:'3a', appNumber:'3a', topic:'Equation Solving', pageGroup:'3', skillTags:['quadratic solving','factoring'], prompt:String.raw`Solve for real solutions:
\[x^2 + 4x = 5\]`, answerType:'expression', answerFormat:String.raw`Enter the solution set, such as \({-5, 1}\).`, howTo:solveHowTo, watchOut:'Move every term to one side before factoring.', hint1:'Subtract 5 from both sides.', hint2:String.raw`Factor \(x^2 + 4x - 5\).`, solutionId:'s-3a', validatorStub:'stage2Validator'},
  {id:'3b', originalLabel:'3b', appNumber:'3b', topic:'Equation Solving', pageGroup:'3', skillTags:['rational equations','restrictions','factoring'], prompt:String.raw`Solve for real solutions:
\[\frac{2}{x} - \frac{3}{x + 2} = 1\]`, answerType:'expression', answerFormat:'Enter the solution set and exclude restricted values.', howTo:solveHowTo, watchOut:String.raw`\(x\) cannot equal \(0\) or \(-2\).`, hint1:String.raw`Multiply by \(x(x + 2)\).`, hint2:String.raw`After clearing denominators, factor \(x^2 + 3x - 4\).`, solutionId:'s-3b', validatorStub:'stage2Validator'},
  {id:'3c', originalLabel:'3c', appNumber:'3c', topic:'Equation Solving', pageGroup:'3', skillTags:['exponential equations','common bases'], prompt:String.raw`Solve for real solutions:
\[5^{x - 1} = 25^{7 - x}\]`, answerType:'numeric', answerFormat:'Enter the value of x.', howTo:solveHowTo, watchOut:String.raw`Rewrite \(25\) as \(5^2\) first.`, hint1:'Use a common base of 5.', hint2:String.raw`Set \(x - 1\) equal to \(14 - 2x\).`, solutionId:'s-3c', validatorStub:'stage2Validator'},
  {id:'3d', originalLabel:'3d', appNumber:'3d', topic:'Equation Solving', pageGroup:'3', skillTags:['logarithmic equations','exponential form','restrictions'], prompt:String.raw`Solve for real solutions:
\[\log_3(2x - 1) = 2\]`, answerType:'numeric', answerFormat:'Enter the value of x.', howTo:solveHowTo, watchOut:'The log argument must be positive.', hint1:'Convert to exponential form.', hint2:String.raw`\(3^2 = 2x - 1\).`, solutionId:'s-3d', validatorStub:'stage2Validator'},
  {id:'3e', originalLabel:'3e', appNumber:'3e', topic:'Equation Solving', pageGroup:'3', skillTags:['logarithmic equations','condensing logs','quadratic formula','restrictions'], prompt:String.raw`Solve for real solutions:
\[\log_2(x + 1) + \log_2(x) = 4\]`, answerType:'multipleChoice', answerFormat:'Choose the exact valid solution. Remember that log arguments must be positive.', choices:[{value:'positive-root', label:String.raw`\(\frac{-1 + \sqrt{65}}{2}\)`},{value:'negative-root', label:String.raw`\(\frac{-1 - \sqrt{65}}{2}\)`},{value:'both-roots', label:String.raw`\(\frac{-1 \pm \sqrt{65}}{2}\)`},{value:'sixteen', label:String.raw`\(16\)`}], correctChoice:'positive-root', howTo:solveHowTo, watchOut:'Only solutions with positive log arguments are valid.', hint1:'Condense the logs using the product rule.', hint2:String.raw`Solve \(x^2 + x - 16 = 0\), then reject the root that makes a log argument invalid.`, solutionId:'s-3e', validatorStub:'stage2Validator'},
  {id:'3f', originalLabel:'3f', appNumber:'3f', topic:'Equation Solving', pageGroup:'3', skillTags:['radical equations','extraneous solutions','factoring'], prompt:String.raw`Solve for real solutions:
\[\sqrt{2x - 2} = 5 - x\]`, answerType:'numeric', answerFormat:'Enter the real solution after checking.', howTo:solveHowTo, watchOut:'Squaring can create extraneous solutions.', hint1:'Square both sides.', hint2:String.raw`Check both \(x = 9\) and \(x = 3\) in the original equation.`, solutionId:'s-3f', validatorStub:'stage2Validator'},
  {id:'3g', originalLabel:'3g', appNumber:'3g', topic:'Equation Solving', pageGroup:'3', skillTags:['polynomial equations','factoring by grouping','radicals'], prompt:String.raw`Solve for real solutions:
\[x^3 + 6x^2 - 2x - 12 = 0\]`, answerType:'checkbox', answerFormat:'Select all real solutions.', choices:[{value:'-6', label:String.raw`\(-6\)`},{value:'sqrt2', label:String.raw`\(\sqrt{2}\)`},{value:'neg-sqrt2', label:String.raw`\(-\sqrt{2}\)`},{value:'6', label:String.raw`\(6\)`},{value:'2', label:String.raw`\(2\)`},{value:'neg-2', label:String.raw`\(-2\)`}], correctChoices:['-6','sqrt2','neg-sqrt2'], howTo:solveHowTo, watchOut:'Factoring by grouping leaves a quadratic factor too.', hint1:'Group the first two and last two terms.', hint2:String.raw`Factor \((x + 6)(x^2 - 2) = 0\).`, solutionId:'s-3g', validatorStub:'stage2Validator'},
  {id:'3h', originalLabel:'3h', appNumber:'3h', topic:'Equation Solving', pageGroup:'3', skillTags:['exponential equations','natural base','natural log'], prompt:String.raw`Solve for real solutions:
\[e^{3x} - 1 = 0\]`, answerType:'numeric', answerFormat:'Enter the value of x.', howTo:solveHowTo, watchOut:String.raw`\(\ln(1) = 0\).`, hint1:String.raw`First isolate \(e^{3x}\).`, hint2:'Take natural log of both sides.', solutionId:'s-3h', validatorStub:'stage2Validator'},
  {id:'3i', originalLabel:'3i', appNumber:'3i', topic:'Equation Solving', pageGroup:'3', skillTags:['exponential equations','natural base','natural log'], prompt:String.raw`Solve for real solutions:
\[2e^{4 - x} + 1 = 7\]`, answerType:'expression', answerFormat:String.raw`Leave the answer in terms of \(\ln\).`, howTo:solveHowTo, watchOut:String.raw`Be careful solving \(4 - x = \ln(3)\) for \(x\).`, hint1:String.raw`Isolate \(e^{4 - x}\).`, hint2:String.raw`After taking \(\ln\), solve \(4 - x = \ln(3)\).`, solutionId:'s-3i', validatorStub:'stage2Validator'},
  {id:'4', originalLabel:'4', appNumber:'4', topic:'Log and Exponential Solving', pageGroup:'4', skillTags:['exponential equations','logarithms','rounding'], prompt:String.raw`Solve and round to 3 decimal places:
\[4^{2x} - 5 = 20\]`, answerType:'numeric', answerFormat:'Enter a decimal rounded to 3 places.', howTo:'Isolate the exponential expression, take logs, use the power rule, and round at the end.', watchOut:'Do not use a calculator solve feature; show the logarithm setup.', hint1:String.raw`First get \(4^{2x} = 25\).`, hint2:String.raw`Use \(2x\log(4) = \log(25)\).`, solutionId:'s-4', validatorStub:'stage2Validator'},
  {id:'5a', originalLabel:'5a', appNumber:'5a', topic:'Function Composition', pageGroup:'5', skillTags:['function composition','evaluating functions'], prompt:String.raw`Given \(f(x) = (x - 1)^2\) and \(g(x) = 2^x\), evaluate \(f(g(3))\).`, answerType:'numeric', answerFormat:'Enter one number.', howTo:'Work from the inside out.', watchOut:'Find g(3) before applying f.', hint1:String.raw`\(g(3) = 2^3\).`, hint2:String.raw`Now calculate \(f(8)\).`, solutionId:'s-5a', validatorStub:'stage2Validator'},
  {id:'5b', originalLabel:'5b', appNumber:'5b', topic:'Function Composition', pageGroup:'5', skillTags:['function composition','evaluating functions'], prompt:String.raw`Given \(f(x) = (x - 1)^2\) and \(g(x) = 2^x\), evaluate \(g(f(-1))\).`, answerType:'numeric', answerFormat:'Enter one number.', howTo:'Work from the inside out.', watchOut:'Find f(-1) before applying g.', hint1:String.raw`\(f(-1) = (-2)^2\).`, hint2:String.raw`Now calculate \(g(4)\).`, solutionId:'s-5b', validatorStub:'stage2Validator'},
  {id:'5c', originalLabel:'5c', appNumber:'5c', topic:'Function Composition', pageGroup:'5', skillTags:['function composition','symbolic composition'], prompt:String.raw`Given \(f(x) = (x - 1)^2\) and \(g(x) = 2^x\), write \(f(g(x))\).`, answerType:'expression', answerFormat:'Enter the symbolic expression.', howTo:'Substitute the entire expression g(x) into f.', watchOut:'Composition is not multiplication.', hint1:String.raw`Replace \(x\) in \(f(x)\) with \(2^x\).`, hint2:String.raw`\(f(g(x)) = (g(x) - 1)^2\).`, solutionId:'s-5c', validatorStub:'stage2Validator'},
  {id:'6a', originalLabel:'6a', appNumber:'6a', topic:'Systems of Equations', pageGroup:'6', skillTags:['systems','linear systems','elimination'], prompt:String.raw`Solve the system:
\[\begin{cases}x - 3y = 9 \\ 2x + y = 4\end{cases}\]`, answerType:'systemSolution', answerFormat:'Enter the ordered pair (x, y).', howTo:'Use elimination or substitution, then write the solution as an ordered pair.', watchOut:'Keep x and y in the correct order.', hint1:'Multiply the first equation by -2 to eliminate x.', hint2:String.raw`You should get \(7y = -14\).`, solutionId:'s-6a', validatorStub:'stage2Validator'},
  {id:'6b', originalLabel:'6b', appNumber:'6b', topic:'Systems of Equations', pageGroup:'6', skillTags:['systems','nonlinear systems','substitution','factoring'], prompt:String.raw`Solve the system:
\[\begin{cases}x^2 + y^2 = 10 \\ x + y = 4\end{cases}\]`, answerType:'systemSolution', answerFormat:'Enter both ordered pairs.', howTo:'Solve one equation for y, substitute, and factor.', watchOut:'This nonlinear system has two solutions.', hint1:String.raw`Use \(y = -x + 4\).`, hint2:String.raw`After substitution, factor \(x^2 - 4x + 3\).`, solutionId:'s-6b', validatorStub:'stage2Validator'},
  {id:'6c', originalLabel:'6c', appNumber:'6c', topic:'Systems of Equations', pageGroup:'6', skillTags:['systems','three-variable systems','elimination'], prompt:String.raw`Solve the system:
\[\begin{cases}3x - 4y + z = 8 \\ 2x + y - z = 4 \\ x - y + 2z = 8\end{cases}\]`, answerType:'systemSolution', answerFormat:'Enter the ordered triple (x, y, z).', howTo:'Use elimination to reduce to two variables, then back-substitute.', watchOut:'Keep the ordered triple in x, y, z order.', hint1:'Combine pairs of equations to eliminate z or another variable.', hint2:'The final values are whole numbers.', solutionId:'s-6c', validatorStub:'stage2Validator'}
];

// Stage 2 normalization: keep the requested data-model keys present on every problem.
window.PROBLEMS = window.PROBLEMS.map(problem => ({graphFeatureId:null, ...problem}));

