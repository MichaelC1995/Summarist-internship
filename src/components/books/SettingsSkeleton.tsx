export default function SettingsSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="h-10 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                <hr className="mb-8 border-gray-200" />

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-7 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                    </div>

                    <div className="space-y-4">
                        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="h-7 bg-gray-200 rounded w-20 mb-4 animate-pulse"></div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}