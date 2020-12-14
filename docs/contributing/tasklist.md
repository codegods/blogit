# Tasklist

Thank you for showing interest in contributing to blogit.
Here are some planned tasks, that you may work upon, sorted according to their priority.

### 1. High priority issues

Naturally, these are the tasks that need to be resolved first.
View them [here](https://github.com/codegods/blogit/issues?q=is%3Aopen+is%3Aissue+label%3A%22severity%3A+high%22).

### 2. Tests

As of now, the repository doesn't have any tests, because of lack of time.
This makes it harder to fix bugs and to introduce new features.
However, now that we are done with a 'It works' version of the project, tests are the
first problem we want to address.

### 3. Remove the use of caches in signups

Currently, when a new user signs up, he has to go through 3 steps.

- Email and password
- Username, firstname & lastname
- Avatar and bio

The app uses in-memory cache to remember the info, that user entered in the previous step.
And, the user actually gets saved to the databae in the last step.
This goes perfectly until we decide to have multiple workers for our app.
Let me explain how it is a major threat to our systems.

<dl>
<dt> Case 1: When we have just one worker </dt>
<dd>
In this case signup goes very well as all connections go to the same server instance and the server is able to remember the previous data from the user.
But this has another problem: It can't scale up. 
As it has only one worker, simultaneous requests isn't possible. 
This isn't tolerable at all.
</dd>
<dt> Case 2: Using multiple workers </dt>
<dd>
This approach fixes the problem presented by single-worker-systems. Good.
But this creates another problem for us.
The different workers don't share the same memory blocks and thus they don't share caches.
Consequently, if different requests of the same user go to different workers, it will fail
because that instance won't identify the user.
</dd>
</dl>

Thus, this issue needs to be resolved soon.

_**Warning:** Draft page_
