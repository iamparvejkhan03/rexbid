// Dummy values so modules that construct SDK clients at import time can load in tests.
process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy";
