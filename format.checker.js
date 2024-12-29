export class FeatureTypeChecker {
    static isFeature(obj) {
        return (
            obj &&
            typeof obj === 'object' &&
            'slug' in obj &&
            'title' in obj &&
            'description' in obj &&
            'url' in obj &&
            'category' in obj &&
            'tags' in obj &&
            'keywords' in obj &&
            'last_test_date' in obj &&
            'test_url' in obj &&
            'test_results_url' in obj &&
            'stats' in obj &&
            'notes' in obj &&
            'notes_by_num' in obj &&
            'links' in obj
        );
    }
}

export class NicenamesTypeChecker {
    static isNicenames(obj) {
        return (
            obj &&
            typeof obj === 'object' &&
            'family' in obj &&
            'platform' in obj &&
            'support' in obj &&
            'category' in obj
        );
    }
}
