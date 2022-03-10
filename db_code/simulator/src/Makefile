
CC=gcc
CFLAGS=-lm -I. -I/usr/include/postgresql -lpq 
DEPS = $(wildcard *.h)
objects := $(patsubst %.c,%.o,$(wildcard *.c))

%.o: %.c $(DEPS)
	$(CC) -c -o $@ $< $(CFLAGS)

main: $(objects)
	$(CC) -o main $(objects) $(CFLAGS)


clear:
	rm *.o 


clearall:
	rm main ; rm *.o 
