export const encode = (message: string) => {
	const encoded: number[] = [];

	for (let i = 0; i < message.length; i++) {
		encoded.push(message.charCodeAt(i));
	}

	return encoded.join(',')
		.replace(/2/g, '004')
		.replace(/3/g, '005')
		.replace(/7/g, '007');
};

export const decode = (message: string) => message
	.replace(/005/g, '3')
	.replace(/004/g, '2')
	.replace(/007/g, '7')
	.split(',')
	.map(i => String.fromCharCode(parseInt(i, 10)))
	.join('');
