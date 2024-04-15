"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const eslint_utils_1 = require("@typescript-eslint/utils/eslint-utils");
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'no-non-null-assertion',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow non-null assertions using the `!` postfix operator',
            recommended: 'strict',
        },
        hasSuggestions: true,
        messages: {
            noNonNull: 'Forbidden non-null assertion.',
            suggestOptionalChain: 'Consider using the optional chain operator `?.` instead. This operator includes runtime checks, so it is safer than the compile-only non-null assertion operator.',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const sourceCode = (0, eslint_utils_1.getSourceCode)(context);
        return {
            TSNonNullExpression(node) {
                const suggest = [];
                // it always exists in non-null assertion
                const nonNullOperator = sourceCode.getTokenAfter(node.expression, util_1.isNonNullAssertionPunctuator);
                function replaceTokenWithOptional() {
                    return fixer => fixer.replaceText(nonNullOperator, '?.');
                }
                function removeToken() {
                    return fixer => fixer.remove(nonNullOperator);
                }
                if (node.parent.type === utils_1.AST_NODE_TYPES.MemberExpression &&
                    node.parent.object === node) {
                    if (!node.parent.optional) {
                        if (node.parent.computed) {
                            // it is x![y]?.z
                            suggest.push({
                                messageId: 'suggestOptionalChain',
                                fix: replaceTokenWithOptional(),
                            });
                        }
                        else {
                            // it is x!.y?.z
                            suggest.push({
                                messageId: 'suggestOptionalChain',
                                fix(fixer) {
                                    // x!.y?.z
                                    //   ^ punctuator
                                    const punctuator = sourceCode.getTokenAfter(nonNullOperator);
                                    return [
                                        fixer.remove(nonNullOperator),
                                        fixer.insertTextBefore(punctuator, '?'),
                                    ];
                                },
                            });
                        }
                    }
                    else {
                        if (node.parent.computed) {
                            // it is x!?.[y].z
                            suggest.push({
                                messageId: 'suggestOptionalChain',
                                fix: removeToken(),
                            });
                        }
                        else {
                            // it is x!?.y.z
                            suggest.push({
                                messageId: 'suggestOptionalChain',
                                fix: removeToken(),
                            });
                        }
                    }
                }
                else if (node.parent.type === utils_1.AST_NODE_TYPES.CallExpression &&
                    node.parent.callee === node) {
                    if (!node.parent.optional) {
                        // it is x.y?.z!()
                        suggest.push({
                            messageId: 'suggestOptionalChain',
                            fix: replaceTokenWithOptional(),
                        });
                    }
                    else {
                        // it is x.y.z!?.()
                        suggest.push({
                            messageId: 'suggestOptionalChain',
                            fix: removeToken(),
                        });
                    }
                }
                context.report({
                    node,
                    messageId: 'noNonNull',
                    suggest,
                });
            },
        };
    },
});
//# sourceMappingURL=no-non-null-assertion.js.map