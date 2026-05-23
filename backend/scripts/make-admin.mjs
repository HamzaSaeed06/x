import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }

await mongoose.connect(uri);

const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  role: String,
  createdAt: Date,
}, { strict: false }));

const emailArg = process.argv[2];

if (emailArg) {
  const result = await User.findOneAndUpdate(
    { email: emailArg.toLowerCase() },
    { $set: { role: 'admin' } },
    { new: true }
  );
  if (result) {
    console.log(`✅ Promoted ${result.email} to admin`);
  } else {
    console.log(`❌ No user found with email: ${emailArg}`);
    const all = await User.find({}, 'email role createdAt').sort({ createdAt: -1 }).limit(10);
    console.log('Registered users:', all.map(u => `${u.email} (${u.role})`).join('\n'));
  }
} else {
  const latest = await User.findOne({}).sort({ createdAt: -1 });
  if (!latest) { console.log('No users found in DB'); process.exit(1); }
  await User.findByIdAndUpdate(latest._id, { $set: { role: 'admin' } });
  console.log(`✅ Promoted most recent user: ${latest.email} → admin`);
}

await mongoose.disconnect();
