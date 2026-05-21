import mongoose from 'mongoose';

const test = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/skillup', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        const activitySchema = new mongoose.Schema({
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            date: { type: String, required: true },
            activity: { type: String, required: true },
        });
        
        const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
        
        const testUserId = new mongoose.Types.ObjectId();
        const dateStr = "2026-04-09";
        const activity = "video_completed";
        
        await Activity.updateOne(
            { user: testUserId, date: dateStr, activity },
            { $setOnInsert: { user: testUserId, date: dateStr, activity } },
            { upsert: true }
        );
        
        console.log("Upsert succeeded");
        
        const docs = await Activity.find({ user: testUserId });
        console.log("Documents:", docs);
        
        await Activity.deleteMany({ user: testUserId });
        process.exit(0);
    } catch (err) {
        console.error("Upsert failed:", err);
        process.exit(1);
    }
};

test();
