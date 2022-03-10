
CC=gcc
CFLAGS=-lm -I. -I/usr/include/postgresql -lpq 
DEPS = $(wildcard *.h)
objects := $(patsubst %.c,%.o,$(wildcard *.c))

#main: rmap, rweather
#	$(CC) -o rmap random-map.c $(CFLAGS) ; $(CC) -o rweather random-weather.c $(CFLAGS)


all:	rmap  rweather rinit

rmap:	random-map.c global.h
	$(CC) -o rmap random-map.c $(CFLAGS)

rweather:	random-weather.c global.h
		$(CC) -o rweather random-weather.c $(CFLAGS)

rinit:	random-init-state.c global.h
	$(CC) -o rinit random-init-state.c $(CFLAGS)

clear:
	rm rmap ; rm rweather ; rm *.o 
