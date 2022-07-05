const exampleData = [
    {
        request: {
            path: [
                {
                    matcher: 'exact',
                    value: '/',
                },
            ],
            method: [
                {
                    matcher: 'exact',
                    value: 'GET',
                },
            ],
            destination: [
                {
                    matcher: 'exact',
                    value: '/',
                },
            ],
            headers: {
                requestHeaderKey: [
                    {
                        matcher: 'exact',
                        value: 'requestHeaderKeys',
                    },
                ],
            },
            query: {
                requestQueryKey: [
                    {
                        matcher: 'exact',
                        value: 'requestQueryKeys',
                    },
                ],
            },
            requiresState: {
                requireStateKey: 'requireStateValue',
            },
        },
        response: {
            status: 200,
            body: '{\n    "key": "value"\n}\n',
            encodedBody: false,
            headers: {
                responseHeaderKey: ['responseHeaderValue'],
            },
            templated: false,
            transitionsState: {
                newStateKey: 'newStateValue',
            },
            fixedDelay: 500,
        },
    },
];

export default exampleData;
